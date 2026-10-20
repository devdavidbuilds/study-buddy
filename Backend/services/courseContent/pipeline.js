const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const zlib = require("zlib");

const { detectSubjectProfile } = require("./subjectProfiles");
const { SYSTEM_PROMPT, buildCurriculumPrompt, buildLessonPrompt, buildFinalAssessmentPrompt, structureTargets } = require("./prompts");
const {
  normalizeCurriculum,
  normalizeLesson,
  normalizeFinalAssessment,
  validateCurriculum,
  validateLesson,
  validateFinalAssessment,
  findDuplicateLessons,
  qualityScore,
  analyzeExistingCourse,
} = require("./validator");
const { assembleCourseContent } = require("./assemble");
const { mockCurriculum, mockLesson, mockFinalAssessment } = require("./mockContent");

// Bump when the generated content shape or quality bar changes; courses
// saved under an older version become eligible for regeneration.
const CONTENT_VERSION = 1;

const LOCK_TTL_MS = 30 * 60 * 1000;
const MAX_ERROR_LOG = 20;

class BudgetExceededError extends Error {}
class StopRequestedError extends Error {}

const gzipJson = (value) => zlib.gzipSync(Buffer.from(JSON.stringify(value)));
const gunzipJson = (buffer) => JSON.parse(zlib.gunzipSync(buffer).toString("utf8"));

const chunk = (items, size) => {
  const out = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
};

const lessonKey = (mi, li) => `${mi}.${li}`;

// ==============================
// createPipeline
//
// models:  { Course, CourseProgress, Quiz, Assignment, ContentGenerationJob }
// llm:     client from services/llm (or null for analysis-only runs)
// options: see scripts/enrichCourses.js for the CLI flags that map here.
// ==============================
const createPipeline = ({ models, llm, options = {}, log = console.log }) => {
  const {
    dryRun = true,
    generate = false, // with dryRun: call the model and write previews, but never touch the DB
    previewDir = null,
    groupSize = 2,
    maxAttempts = 3,
    includeActive = false,
    force = false,
    retryFailed = false,
    allowMockWrites = false,
    maxCalls = Infinity,
    maxOutputTokens = Infinity,
    lessonMaxOutputTokens = 8192,
    verifyAnswers = true,
    layout = null, // exact { modules, lessonsPerModule }, e.g. 6 x 5 = 30 lessons
    finalQuestions = 0, // >0 adds a course-wide final assessment with this many questions
  } = options;

  const { Course, CourseProgress, Quiz, Assignment, ContentGenerationJob: Job } = models;
  const runId = crypto.randomUUID();
  const willCallModel = !dryRun || generate;
  let stopRequested = false;

  if (willCallModel && !llm) throw new Error("An LLM client is required to generate content.");
  if (llm?.isMock && !dryRun && !allowMockWrites) {
    throw new Error("Refusing to save mock content. Use --dry-run with the mock provider, or configure a real LLM provider.");
  }

  /* ---------- budget ---------- */

  const checkBudget = () => {
    if (stopRequested) throw new StopRequestedError("Stop requested.");
    if (!llm) return;
    if (llm.usage.calls >= maxCalls) throw new BudgetExceededError(`Call budget reached (${maxCalls} calls).`);
    if (llm.usage.outputTokens >= maxOutputTokens) {
      throw new BudgetExceededError(`Output token budget reached (${maxOutputTokens} tokens).`);
    }
  };

  // Per-call usage comes from the call's own result, so stats stay correct
  // when several courses run concurrently on one client.
  const tracked = async (job, fn) => {
    checkBudget();
    let result;
    try {
      result = await fn();
    } catch (error) {
      if (error.quotaExhausted) {
        // Daily/project quota: every further call would fail too.
        stopRequested = true;
        throw new BudgetExceededError(`Provider quota exhausted — ${error.message}`);
      }
      throw error;
    }
    if (job && result?.usage) {
      job.stats.calls += 1;
      job.stats.inputTokens += result.usage.inputTokens || 0;
      job.stats.outputTokens += result.usage.outputTokens || 0;
    }
    return result;
  };

  // Independent answer-key check: the model answers each question without
  // seeing the key. Returns, per item, the 1-based numbers of disputed
  // questions (null when the verdict was unusable).
  const verifyAnswerKeys = async (job, items, mockDispute) => {
    const { data: verdict } = await tracked(job, () =>
      llm.generateJSON({
        system: "You are a careful examiner. Answer each multiple-choice question with the index (0-3) of the single best option. Respond with JSON only.",
        user: [
          'Answer every question. JSON schema: {"lessons": [{"answers": [number, ...]}]} in the same order as given.',
          "",
          JSON.stringify(
            items.map((item) => ({
              lesson: item.title,
              questions: item.questions.map((q) => ({ question: q.question, options: q.options })),
            }))
          ),
        ].join("\n"),
        maxOutputTokens: 2048,
        temperature: 0,
        mockResponse: () => ({
          lessons: items.map((item) => ({
            answers: item.questions.map((q) => (mockDispute ? (q.correctIndex + 1) % 4 : q.correctIndex)),
          })),
        }),
      })
    );

    return items.map((item, index) => {
      const answers = verdict?.lessons?.[index]?.answers;
      if (!Array.isArray(answers)) return null;
      return item.questions.map((q, qi) => (Number(answers[qi]) === q.correctIndex ? null : qi + 1)).filter(Boolean);
    });
  };

  /* ---------- job persistence helpers ---------- */

  const logError = (job, stage, message) => {
    if (!job) return;
    job.lastError = message;
    job.errorLog.push({ at: new Date(), stage, message: String(message).slice(0, 500) });
    if (job.errorLog.length > MAX_ERROR_LOG) job.errorLog.splice(0, job.errorLog.length - MAX_ERROR_LOG);
  };

  const saveJob = async (job) => {
    if (!job || dryRun) return;
    job.markModified("draft");
    await job.save();
  };

  const releaseLock = async (job) => {
    if (!job || dryRun) return;
    job.lockId = null;
    job.lockedAt = null;
    await saveJob(job);
  };

  // Atomically claim the course's job document. Returns null if another
  // runner holds a fresh lock.
  const acquireJob = async (course, profile) => {
    const now = new Date();
    try {
      return await Job.findOneAndUpdate(
        {
          course: course._id,
          $or: [{ lockId: null }, { lockedAt: { $lt: new Date(now.getTime() - LOCK_TTL_MS) } }],
        },
        {
          $set: { lockId: runId, lockedAt: now, courseCode: course.courseCode, subjectProfile: profile.key },
          $setOnInsert: { status: "pending" },
        },
        { upsert: true, new: true }
      );
    } catch (error) {
      if (error.code === 11000) return null; // locked by another runner
      throw error;
    }
  };

  /* ---------- dependents (student/faculty records tied to lesson ids) ---------- */

  const countDependents = async (courseId) => {
    const [progress, quizzes, assignments] = await Promise.all([
      CourseProgress.countDocuments({ course: courseId }),
      Quiz.countDocuments({ course: courseId }),
      Assignment.countDocuments({ course: courseId }),
    ]);
    return { progress, quizzes, assignments, total: progress + quizzes + assignments };
  };

  /* ---------- generation steps ---------- */

  const generateCurriculum = async (course, profile, job) => {
    let feedback = "";
    let lastProblem = "";
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      const user = buildCurriculumPrompt(course, profile, layout) + (feedback ? `\n\nA previous attempt was rejected. Fix:\n${feedback}` : "");
      let curriculum;
      try {
        const { data } = await tracked(job, () =>
          llm.generateJSON({
            system: SYSTEM_PROMPT,
            user,
            maxOutputTokens: 4096,
            temperature: 0.4,
            mockResponse: () => mockCurriculum(course, layout),
          })
        );
        curriculum = normalizeCurriculum(data);
      } catch (error) {
        if (error instanceof BudgetExceededError || error instanceof StopRequestedError) throw error;
        logError(job, "curriculum", error.message);
        lastProblem = error.message;
        feedback = `The response could not be used: ${error.message}`;
        continue;
      }

      const { errors } = validateCurriculum(curriculum, { course, layout });
      if (!errors.length) return curriculum;
      logError(job, "curriculum", errors.join(" | "));
      lastProblem = errors.join(" | ");
      feedback = errors.map((e) => `- ${e}`).join("\n");
    }
    throw new Error(`Curriculum failed validation after ${maxAttempts} attempts: ${lastProblem}`);
  };

  // Generate one group of lessons; returns { accepted: {key: lesson}, warnings: {key: [..]} }
  const generateLessonGroup = async ({ course, profile, curriculum, moduleIndex, lessonIndexes, drafted, job, feedback, attempt }) => {
    const covered = Object.values(drafted).flatMap((l) => l.concepts.map((c) => c.term));
    const module = curriculum.modules[moduleIndex];
    const badKeyForTest = process.env.CONTENT_MOCK_BAD_FIRST_ATTEMPT === "1" && attempt === 1;

    const { data } = await tracked(job, () =>
      llm.generateJSON({
        system: SYSTEM_PROMPT,
        user: buildLessonPrompt({ course, profile, curriculum, moduleIndex, lessonIndexes, coveredConcepts: covered, feedback }),
        maxOutputTokens: lessonMaxOutputTokens,
        temperature: 0.5,
        mockResponse: () => ({
          lessons: lessonIndexes.map((li) => mockLesson(module.lessons[li].title, profile, { badAnswerKey: badKeyForTest })),
        }),
      })
    );

    const returned = Array.isArray(data?.lessons) ? data.lessons.map(normalizeLesson) : [];
    const accepted = {};
    const warnings = {};
    const problems = [];

    lessonIndexes.forEach((li) => {
      const expectedTitle = module.lessons[li].title;
      const key = lessonKey(moduleIndex, li);
      // Match by title first, then by position, so a reordered response still lines up.
      const lesson =
        returned.find((l) => l.title.toLowerCase() === expectedTitle.toLowerCase()) ||
        returned[lessonIndexes.indexOf(li)];

      if (!lesson) {
        problems.push({ key, message: `Lesson "${expectedTitle}" was missing from the response.` });
        return;
      }
      lesson.title = expectedTitle;

      const result = validateLesson(lesson, { expectedTitle, profile });
      if (result.errors.length) {
        problems.push({ key, message: `"${expectedTitle}": ${result.errors.join(" ")}` });
        return;
      }
      accepted[key] = lesson;
      warnings[key] = result.warnings;
    });

    // Independent answer-key check: the model answers the questions
    // without seeing the key; disagreements send the lesson back.
    if (verifyAnswers && Object.keys(accepted).length) {
      const keys = Object.keys(accepted);
      const verdicts = await verifyAnswerKeys(
        job,
        keys.map((key) => ({ title: accepted[key].title, questions: accepted[key].assessment })),
        process.env.CONTENT_MOCK_DISPUTE_FIRST_ATTEMPT === "1" && attempt === 1
      );

      keys.forEach((key, index) => {
        const disputed = verdicts[index];
        if (!disputed) return; // unusable verdict: keep structural validation result
        if (disputed.length) {
          problems.push({
            key,
            message: `"${accepted[key].title}": assessment question(s) ${disputed.join(", ")} have a disputed answer key — make sure exactly one option is unambiguously correct and correctIndex points to it.`,
          });
          delete accepted[key];
          delete warnings[key];
        }
      });
    }

    // Cross-lesson duplicate check against everything drafted so far.
    const ordered = Object.entries({ ...drafted, ...accepted })
      .sort(([a], [b]) => {
        const [am, al] = a.split(".").map(Number);
        const [bm, bl] = b.split(".").map(Number);
        return am - bm || al - bl;
      })
      .map(([key, lesson]) => ({ key, lesson }));
    const duplicates = findDuplicateLessons(ordered);
    for (const key of Object.keys(accepted)) {
      if (duplicates.has(key)) {
        problems.push({ key, message: `"${accepted[key].title}": ${duplicates.get(key)}` });
        delete accepted[key];
        delete warnings[key];
      }
    }

    return { accepted, warnings, problems };
  };

  const generateAllLessons = async ({ course, profile, curriculum, job, draft }) => {
    const drafted = draft.lessons || {};
    const lessonWarnings = draft.lessonWarnings || {};

    for (let mi = 0; mi < curriculum.modules.length; mi++) {
      const pending = curriculum.modules[mi].lessons.map((_, li) => li).filter((li) => !drafted[lessonKey(mi, li)]);

      for (const group of chunk(pending, groupSize)) {
        let remaining = group;
        let feedback = "";

        for (let attempt = 1; attempt <= maxAttempts && remaining.length; attempt++) {
          let result;
          try {
            result = await generateLessonGroup({
              course, profile, curriculum, moduleIndex: mi, lessonIndexes: remaining, drafted, job, feedback, attempt,
            });
          } catch (error) {
            if (error instanceof BudgetExceededError || error instanceof StopRequestedError) throw error;
            logError(job, `module ${mi + 1}`, error.message);
            // A truncated multi-lesson response: retry the lessons one at a time.
            if (error.truncated && remaining.length > 1) {
              for (const single of remaining) {
                await generateAllLessonsSingle({ course, profile, curriculum, job, drafted, lessonWarnings, mi, li: single });
              }
              remaining = [];
              break;
            }
            feedback = `The previous response could not be used: ${error.message}`;
            continue;
          }

          Object.assign(drafted, result.accepted);
          Object.assign(lessonWarnings, result.warnings);
          draft.lessons = drafted;
          draft.lessonWarnings = lessonWarnings;
          if (job) {
            job.draft = { curriculum, lessons: drafted, lessonWarnings };
            await saveJob(job); // checkpoint after every group
          }

          remaining = remaining.filter((li) => !drafted[lessonKey(mi, li)]);
          if (remaining.length) {
            const message = result.problems.map((p) => p.message).join("\n");
            logError(job, `module ${mi + 1}`, message);
            feedback = message;
          }
        }

        if (remaining.length) {
          throw new Error(
            `Module ${mi + 1} lessons ${remaining.map((li) => li + 1).join(", ")} failed validation after ${maxAttempts} attempts: ${feedback}`
          );
        }
      }
    }
    return { drafted, lessonWarnings };
  };

  const generateFinalAssessment = async ({ course, profile, curriculum, lessons, job }) => {
    let feedback = "";
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      let final;
      try {
        const { data } = await tracked(job, () =>
          llm.generateJSON({
            system: SYSTEM_PROMPT,
            user: buildFinalAssessmentPrompt({ course, profile, curriculum, lessons, questionCount: finalQuestions, feedback }),
            maxOutputTokens: lessonMaxOutputTokens,
            temperature: 0.4,
            mockResponse: () =>
              mockFinalAssessment(course, curriculum, finalQuestions, {
                badAnswerKey: process.env.CONTENT_MOCK_BAD_FIRST_ATTEMPT === "1" && attempt === 1,
              }),
          })
        );
        final = normalizeFinalAssessment(data);
      } catch (error) {
        if (error instanceof BudgetExceededError || error instanceof StopRequestedError) throw error;
        logError(job, "final assessment", error.message);
        feedback = `The previous response could not be used: ${error.message}`;
        continue;
      }

      const { errors, warnings } = validateFinalAssessment(final, { questionCount: finalQuestions, moduleCount: curriculum.modules.length });
      if (!errors.length && verifyAnswers) {
        const [disputed] = await verifyAnswerKeys(
          job,
          [{ title: `${course.courseName} — final assessment`, questions: final.questions }],
          process.env.CONTENT_MOCK_DISPUTE_FIRST_ATTEMPT === "1" && attempt === 1
        );
        if (disputed?.length) {
          errors.push(
            `Question(s) ${disputed.join(", ")} have a disputed answer key — make sure exactly one option is unambiguously correct and correctIndex points to it.`
          );
        }
      }
      if (!errors.length) return { final, warnings };

      feedback = errors.map((e) => `- ${e}`).join("\n");
      logError(job, "final assessment", errors.join(" | "));
    }
    throw new Error(`Final assessment failed validation after ${maxAttempts} attempts: ${feedback}`);
  };

  // Fallback used after truncation: one lesson per request.
  const generateAllLessonsSingle = async ({ course, profile, curriculum, job, drafted, lessonWarnings, mi, li }) => {
    let feedback = "";
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const result = await generateLessonGroup({
          course, profile, curriculum, moduleIndex: mi, lessonIndexes: [li], drafted, job, feedback, attempt,
        });
        Object.assign(drafted, result.accepted);
        Object.assign(lessonWarnings, result.warnings);
        if (drafted[lessonKey(mi, li)]) return;
        feedback = result.problems.map((p) => p.message).join("\n");
        logError(job, `module ${mi + 1}`, feedback);
      } catch (error) {
        if (error instanceof BudgetExceededError || error instanceof StopRequestedError) throw error;
        logError(job, `module ${mi + 1}`, error.message);
        feedback = `The previous response could not be used: ${error.message}`;
      }
    }
    throw new Error(`Lesson ${mi + 1}.${li + 1} failed after ${maxAttempts} attempts: ${feedback}`);
  };

  /* ---------- apply ---------- */

  const takeBackupIfNeeded = (job, course) => {
    const needsBackup =
      !job.backup?.data ||
      // Course still holds its original (never enriched) content but was
      // edited since the backup — refresh so rollback restores the latest original.
      (!course.contentMeta && String(job.backup.sourceUpdatedAt) !== String(course.updatedAt));

    if (needsBackup) {
      job.backup = {
        data: gzipJson({
          modules: course.modules || [],
          duration: course.duration,
          outcomes: course.outcomes || [],
          contentMeta: course.contentMeta || null,
        }),
        takenAt: new Date(),
        sourceUpdatedAt: course.updatedAt,
      };
    }
  };

  const applyToCourse = async ({ course, job, assembled, profile, curriculum, score }) => {
    const result = await Course.updateOne(
      // Optimistic concurrency: only write if nobody changed the course
      // since we read it at the start of this run.
      { _id: course._id, updatedAt: course.updatedAt },
      {
        $set: {
          modules: assembled.modules,
          duration: assembled.duration,
          outcomes: assembled.outcomes.length ? assembled.outcomes : course.outcomes,
          contentMeta: {
            version: CONTENT_VERSION,
            generatedAt: new Date(),
            provider: llm.name,
            model: llm.model,
            subjectProfile: profile.key,
            qualityScore: score,
            estimatedMinutes: assembled.estimatedMinutes,
            summary: curriculum.summary,
            audience: curriculum.audience,
            prerequisites: curriculum.prerequisites,
          },
        },
      },
      { runValidators: true }
    );

    if (result.matchedCount === 0) {
      throw new Error("Course was modified by someone else during generation; nothing was written. Re-run to retry.");
    }
  };

  const writePreview = (course, payload) => {
    if (!previewDir) return null;
    fs.mkdirSync(previewDir, { recursive: true });
    const file = path.join(previewDir, `${course.courseCode || course._id}.json`);
    fs.writeFileSync(file, JSON.stringify(payload, null, 2));
    return file;
  };

  /* ---------- per-course entry point ---------- */

  const processCourse = async (courseId) => {
    const course = await Course.findById(courseId).lean();
    if (!course) return { status: "missing", courseId };

    const label = `${course.courseCode} "${course.courseName}"`;
    const profile = detectSubjectProfile(course);
    const analysis = analyzeExistingCourse(course, { contentVersion: CONTENT_VERSION });
    const base = { courseId: String(course._id), courseCode: course.courseCode, title: course.courseName, profile: profile.key };

    if (!analysis.needsEnrichment && !force) {
      return { ...base, status: "skipped", reason: "content already valid for current version" };
    }

    const dependents = await countDependents(course._id);
    if (dependents.total > 0 && !includeActive) {
      const reason = `has ${dependents.progress} progress / ${dependents.quizzes} quiz / ${dependents.assignments} assignment records tied to its lesson ids (use --include-active to override)`;
      if (!dryRun) {
        await Job.updateOne(
          { course: course._id },
          { $set: { status: "skipped", lastError: reason, courseCode: course.courseCode } },
          { upsert: true }
        );
      }
      return { ...base, status: "skipped", reason };
    }

    if (!willCallModel) {
      return { ...base, status: "needs-enrichment", reasons: analysis.reasons, lessons: analysis.lessonCount, targets: structureTargets(course, layout) };
    }

    // Dry-run generation keeps everything in memory.
    let job = null;
    const draft = { curriculum: null, lessons: {}, lessonWarnings: {}, final: null };

    if (!dryRun) {
      job = await acquireJob(course, profile);
      if (!job) return { ...base, status: "locked", reason: "another runner is processing this course" };

      if (job.status === "failed" && !retryFailed && !force) {
        await releaseLock(job);
        return { ...base, status: "skipped", reason: `previous attempt failed (${job.lastError.slice(0, 120)}); use --retry-failed` };
      }

      const resumable = job.contentVersion === CONTENT_VERSION && job.status !== "completed" && !force;
      // A draft planned for a different structure cannot be resumed under this one.
      const layoutMatches = (curriculum) =>
        !layout ||
        (curriculum.modules.length === layout.modules && curriculum.modules.every((m) => m.lessons.length === layout.lessonsPerModule));
      if (resumable && job.draft?.curriculum && layoutMatches(job.draft.curriculum)) {
        draft.curriculum = job.draft.curriculum;
        draft.lessons = job.draft.lessons || {};
        draft.lessonWarnings = job.draft.lessonWarnings || {};
        draft.final = job.draft.final || null;
      }

      job.status = "in_progress";
      job.contentVersion = CONTENT_VERSION;
      job.provider = llm.name;
      job.model = llm.model;
      job.attempts += 1;
      job.startedAt = job.startedAt && resumable ? job.startedAt : new Date();
      job.draft = draft;
      takeBackupIfNeeded(job, course);
      await saveJob(job);
    }

    try {
      if (!draft.curriculum) {
        draft.curriculum = await generateCurriculum(course, profile, job);
        if (job) {
          job.draft = draft;
          await saveJob(job);
        }
      } else {
        log(`  resuming ${label}: ${Object.keys(draft.lessons).length} lessons already drafted`);
      }

      const { drafted, lessonWarnings } = await generateAllLessons({ course, profile, curriculum: draft.curriculum, job, draft });

      // Final course-wide check before anything is written.
      const ordered = Object.keys(drafted)
        .sort((a, b) => {
          const [am, al] = a.split(".").map(Number);
          const [bm, bl] = b.split(".").map(Number);
          return am - bm || al - bl;
        })
        .map((key) => ({ key, lesson: drafted[key] }));
      const duplicates = findDuplicateLessons(ordered);
      if (duplicates.size) {
        for (const key of duplicates.keys()) delete drafted[key];
        throw new Error(`Duplicate lessons detected: ${[...duplicates.values()].join(" | ")}`);
      }

      if (finalQuestions > 0 && !draft.final) {
        const { final, warnings: finalWarnings } = await generateFinalAssessment({
          course, profile, curriculum: draft.curriculum, lessons: drafted, job,
        });
        draft.final = final;
        lessonWarnings.final = finalWarnings;
        if (job) {
          job.draft = { curriculum: draft.curriculum, lessons: drafted, lessonWarnings, final };
          await saveJob(job);
        }
      }

      const assembled = assembleCourseContent({
        curriculum: draft.curriculum,
        lessons: drafted,
        finalAssessment: finalQuestions > 0 ? draft.final : null,
      });
      const scores = Object.values(lessonWarnings).map((w) => qualityScore(w.length));
      const score = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 100;
      const warnings = Object.entries(lessonWarnings).flatMap(([key, list]) => list.map((w) => `${key}: ${w}`));

      if (dryRun) {
        const previewFile = writePreview(course, { course: base, curriculum: draft.curriculum, ...assembled, qualityScore: score, warnings });
        return {
          ...base,
          status: "generated (dry run, not saved)",
          lessons: assembled.lessonCount,
          finalQuestions: assembled.finalQuestions,
          duration: assembled.duration,
          qualityScore: score,
          warnings: warnings.length,
          previewFile,
        };
      }

      await applyToCourse({ course, job, assembled, profile, curriculum: draft.curriculum, score });

      job.status = "completed";
      job.completedAt = new Date();
      job.qualityScore = score;
      job.warnings = warnings.slice(0, 50);
      job.lastError = "";
      job.draft = { curriculum: null, lessons: {} };
      await releaseLock(job);

      return {
        ...base,
        status: "completed",
        lessons: assembled.lessonCount,
        finalQuestions: assembled.finalQuestions,
        duration: assembled.duration,
        qualityScore: score,
        warnings: warnings.length,
      };
    } catch (error) {
      if (error instanceof BudgetExceededError || error instanceof StopRequestedError) {
        // Leave the job resumable: draft is already checkpointed.
        if (job) await releaseLock(job);
        throw error;
      }
      if (job) {
        job.status = "failed";
        logError(job, "course", error.message);
        await releaseLock(job);
      }
      return { ...base, status: "failed", error: error.message };
    }
  };

  return {
    runId,
    processCourse,
    requestStop: () => {
      stopRequested = true;
    },
    countDependents,
  };
};

module.exports = {
  CONTENT_VERSION,
  createPipeline,
  BudgetExceededError,
  StopRequestedError,
  gunzipJson,
};
