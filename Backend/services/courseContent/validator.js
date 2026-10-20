const { PRACTICE_TYPES } = require("./subjectProfiles");
const { countWords } = require("./estimate");

// ==============================
// Validation for generated course content.
//
// Every curriculum and lesson produced by a model passes through
// normalize* (shape coercion) and validate* (quality gates) before it can
// be saved. `errors` block saving and trigger regeneration with the
// errors fed back to the model; `warnings` only lower the quality score.
// ==============================

const LIMITS = {
  modules: { min: 3, max: 7 },
  lessonsPerModule: { min: 2, max: 7 },
  totalLessons: { min: 8, max: 40 },
  objectives: { min: 3, max: 6 },
  explanationWords: { min: 300, max: 2200 },
  concepts: { min: 3, max: 8 },
  examples: { min: 1, max: 4 },
  mistakes: { min: 2, max: 6 },
  takeaways: { min: 3, max: 8 },
  practice: { min: 2, max: 6 },
  assessment: { min: 3, max: 6 },
  finalQuestions: { min: 10, max: 25 },
  finalReviewWords: { min: 250, max: 1500 },
  // Explanations sharing more than this fraction of 5-word shingles are
  // treated as duplicates.
  duplicateSimilarity: 0.3,
};

// Deliberately narrow: words like "placeholder", "lorem ipsum" or a
// "// TODO" comment are legitimate inside HTML, design and coding lessons.
const PLACEHOLDER_PATTERNS = [
  /\[(insert|add|your|todo|tbd)\b[^\]]*\]/i,
  /as an ai(?: language)? model/i,
  // Phrases from the original CSV importer's template text.
  /introduces the essential principles behind/i,
  /build confidence through guided practice across/i,
];

const STOP_WORDS = new Set(
  "a an and are as at be by for from how in into is it its of on or the to with your you using use what why when this that these those learn learning lesson introduction intro basics part course module complete guide beginners beginner advanced master mastering".split(" ")
);

/* ---------- helpers ---------- */

const str = (value) => (typeof value === "string" ? value.trim() : value == null ? "" : String(value).trim());
const strList = (value) => (Array.isArray(value) ? value.map(str).filter(Boolean) : []);
const norm = (value) => str(value).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const meaningfulTerms = (value) =>
  norm(value)
    .split(" ")
    .filter((term) => term.length > 3 && !STOP_WORDS.has(term));

// Loose stem for relevance checks: "html5" -> "html", "investment" -> "inves".
const stem = (term) => term.replace(/\d+$/, "").slice(0, 5);
const mentions = (text, terms) =>
  terms.filter((term) => stem(term).length >= 3).some((term) => text.includes(stem(term)));

// Model answers may be pure code (few spaces), so accept either enough
// words or enough non-space characters.
const hasSubstance = (value, minWords) =>
  countWords(value) >= minWords || str(value).replace(/\s/g, "").length >= minWords * 4;

const shingles = (text, size = 5) => {
  const words = norm(text).split(" ").filter(Boolean);
  const set = new Set();
  for (let i = 0; i + size <= words.length; i++) set.add(words.slice(i, i + size).join(" "));
  return set;
};

const similarity = (a, b) => {
  const setA = a instanceof Set ? a : shingles(a);
  const setB = b instanceof Set ? b : shingles(b);
  if (!setA.size || !setB.size) return 0;
  let shared = 0;
  for (const item of setA) if (setB.has(item)) shared++;
  return shared / Math.min(setA.size, setB.size);
};

const findPlaceholder = (text) => PLACEHOLDER_PATTERNS.find((pattern) => pattern.test(text));

const inRange = (count, { min, max }) => count >= min && count <= max;

/* ---------- normalization ---------- */

const normalizeCurriculum = (raw) => ({
  summary: str(raw?.summary),
  audience: str(raw?.audience),
  prerequisites: strList(raw?.prerequisites),
  outcomes: strList(raw?.outcomes),
  modules: (Array.isArray(raw?.modules) ? raw.modules : []).map((module) => ({
    title: str(module?.title),
    summary: str(module?.summary),
    lessons: (Array.isArray(module?.lessons) ? module.lessons : []).map((lesson) => ({
      title: str(lesson?.title),
      focus: str(lesson?.focus),
    })),
  })),
});

const normalizeLesson = (raw) => {
  const assessment = (Array.isArray(raw?.assessment) ? raw.assessment : []).map((item) => {
    const options = strList(item?.options);
    const index = Number(item?.correctIndex);
    return {
      question: str(item?.question),
      options,
      correctIndex: Number.isInteger(index) ? index : -1,
      answer: Number.isInteger(index) && options[index] ? options[index] : "",
      explanation: str(item?.explanation),
    };
  });

  return {
    title: str(raw?.title),
    summary: str(raw?.summary),
    objectives: strList(raw?.objectives),
    explanation: str(raw?.explanation),
    concepts: (Array.isArray(raw?.concepts) ? raw.concepts : [])
      .map((c) => ({ term: str(c?.term), definition: str(c?.definition) }))
      .filter((c) => c.term || c.definition),
    examples: (Array.isArray(raw?.examples) ? raw.examples : []).map((ex) => ({
      title: str(ex?.title),
      scenario: str(ex?.scenario),
      steps: strList(ex?.steps),
      solution: str(ex?.solution),
      code: typeof ex?.code === "string" ? ex.code.replace(/^\n+|\s+$/g, "") : "",
      language: str(ex?.language).toLowerCase(),
    })),
    applications: strList(raw?.applications),
    mistakes: (Array.isArray(raw?.mistakes) ? raw.mistakes : [])
      .map((m) => ({ mistake: str(m?.mistake), fix: str(m?.fix) }))
      .filter((m) => m.mistake || m.fix),
    tips: strList(raw?.tips),
    takeaways: strList(raw?.takeaways),
    revisionNotes: str(raw?.revisionNotes),
    practice: (Array.isArray(raw?.practice) ? raw.practice : []).map((p) => ({
      type: norm(p?.type).replace(/ /g, "-"),
      prompt: str(p?.prompt),
      hint: str(p?.hint),
      answer: str(p?.answer),
    })),
    assessment,
  };
};

/* ---------- curriculum ---------- */

// layout (optional): { modules, lessonsPerModule } — an exact structure
// requested for a batch, e.g. 6 x 5 = 30 lessons.
const validateCurriculum = (curriculum, { course, layout } = {}) => {
  const errors = [];
  const warnings = [];
  const modules = curriculum.modules || [];

  if (layout) {
    if (modules.length !== layout.modules) {
      errors.push(`Curriculum must have exactly ${layout.modules} modules (got ${modules.length}).`);
    }
    modules.forEach((module, mi) => {
      if (module.lessons.length !== layout.lessonsPerModule) {
        errors.push(`Module ${mi + 1} must have exactly ${layout.lessonsPerModule} lessons (got ${module.lessons.length}).`);
      }
    });
  }

  if (!inRange(modules.length, LIMITS.modules)) {
    errors.push(`Curriculum must have ${LIMITS.modules.min}-${LIMITS.modules.max} modules (got ${modules.length}).`);
  }

  const total = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  if (!inRange(total, LIMITS.totalLessons)) {
    errors.push(`Curriculum must have ${LIMITS.totalLessons.min}-${LIMITS.totalLessons.max} lessons in total (got ${total}).`);
  }

  const moduleTitles = new Set();
  const lessonTitles = new Set();

  modules.forEach((module, mi) => {
    const label = `Module ${mi + 1}`;
    if (!module.title) errors.push(`${label} has no title.`);
    const key = norm(module.title);
    if (key && moduleTitles.has(key)) errors.push(`${label} title "${module.title}" is duplicated.`);
    moduleTitles.add(key);

    if (!inRange(module.lessons.length, LIMITS.lessonsPerModule)) {
      errors.push(`${label} must have ${LIMITS.lessonsPerModule.min}-${LIMITS.lessonsPerModule.max} lessons (got ${module.lessons.length}).`);
    }

    module.lessons.forEach((lesson, li) => {
      const lessonLabel = `${label}, lesson ${li + 1}`;
      if (!lesson.title) errors.push(`${lessonLabel} has no title.`);
      const lessonKey = norm(lesson.title);
      if (lessonKey && lessonTitles.has(lessonKey)) errors.push(`${lessonLabel} title "${lesson.title}" duplicates another lesson.`);
      lessonTitles.add(lessonKey);
      if (countWords(lesson.focus) < 6) errors.push(`${lessonLabel} needs a "focus" of at least 6 words.`);
    });
  });

  if (curriculum.outcomes.length < 3) warnings.push("Curriculum lists fewer than 3 course outcomes.");

  // Relevance: the plan should talk about the course's own subject.
  if (course) {
    const titleTerms = meaningfulTerms(course.courseName);
    const planText = norm(
      [curriculum.summary, ...curriculum.outcomes, ...modules.flatMap((m) => [m.title, ...m.lessons.map((l) => `${l.title} ${l.focus}`)])].join(" ")
    );
    if (titleTerms.some((term) => stem(term).length >= 3) && !mentions(planText, titleTerms)) {
      errors.push(`Curriculum does not appear to cover the course topic "${course.courseName}".`);
    }
  }

  return { errors, warnings };
};

/* ---------- lesson ---------- */

// Multiple-choice checks shared by lesson checks and the final assessment.
const checkQuestions = (questions, { fail, warnings, label: prefix }) => {
  const correctPositions = [];
  const seen = new Set();
  questions.forEach((q, i) => {
    const label = `${prefix} ${i + 1}`;
    if (countWords(q.question) < 5) fail(`${label} is too short.`);
    if (seen.has(norm(q.question))) fail(`${label} repeats an earlier question.`);
    seen.add(norm(q.question));
    if (q.options.length !== 4) fail(`${label} must have exactly 4 options (got ${q.options.length}).`);
    const uniqueOptions = new Set(q.options.map(norm));
    if (uniqueOptions.size !== q.options.length) fail(`${label} has duplicate options.`);
    if (q.options.some((o) => !norm(o))) fail(`${label} has an empty option.`);
    if (q.correctIndex < 0 || q.correctIndex > 3 || !q.answer) {
      fail(`${label} needs a valid correctIndex (0-3).`);
    }
    if (q.options.some((o) => /^(all|none) of the above$/i.test(o))) {
      warnings.push(`${label} uses "all/none of the above".`);
    }
    if (countWords(q.explanation) < 6) fail(`${label} needs an explanation of at least 6 words.`);
    correctPositions.push(q.correctIndex);
  });
  if (questions.length >= 4 && new Set(correctPositions).size === 1) {
    warnings.push("All assessment answers are in the same position.");
  }
};

const validateLesson = (lesson, { expectedTitle, profile } = {}) => {
  const errors = [];
  const warnings = [];
  const fail = (message) => errors.push(message);

  if (expectedTitle && norm(lesson.title) !== norm(expectedTitle)) {
    fail(`Lesson title must be exactly "${expectedTitle}" (got "${lesson.title}").`);
  }

  if (!inRange(lesson.objectives.length, LIMITS.objectives)) {
    fail(`Provide ${LIMITS.objectives.min}-${LIMITS.objectives.max} learning objectives (got ${lesson.objectives.length}).`);
  }
  lesson.objectives.forEach((objective, i) => {
    if (countWords(objective) < 4) fail(`Objective ${i + 1} is too short to be meaningful.`);
  });

  const words = countWords(lesson.explanation);
  if (words < LIMITS.explanationWords.min) fail(`Explanation is too short (${words} words, need at least ${LIMITS.explanationWords.min}).`);
  if (words > LIMITS.explanationWords.max) fail(`Explanation is too long (${words} words, max ${LIMITS.explanationWords.max}).`);

  if (!inRange(lesson.concepts.length, LIMITS.concepts)) {
    fail(`Provide ${LIMITS.concepts.min}-${LIMITS.concepts.max} key concepts (got ${lesson.concepts.length}).`);
  }
  lesson.concepts.forEach((concept, i) => {
    if (!concept.term || countWords(concept.definition) < 6) fail(`Concept ${i + 1} needs a term and a definition of at least 6 words.`);
  });

  if (!inRange(lesson.examples.length, LIMITS.examples)) {
    fail(`Provide ${LIMITS.examples.min}-${LIMITS.examples.max} worked examples (got ${lesson.examples.length}).`);
  }
  lesson.examples.forEach((example, i) => {
    if (!example.title) fail(`Example ${i + 1} has no title.`);
    if (example.steps.length < 2 && countWords(example.solution) < 20) {
      fail(`Example ${i + 1} must show at least 2 steps or a worked solution of 20+ words.`);
    }
    if (example.code && profile && !profile.allowsCode) {
      fail(`Example ${i + 1} contains code, which is not appropriate for a ${profile.label} course.`);
    }
    if (example.code && !example.language) warnings.push(`Example ${i + 1} code has no language set.`);
  });

  if (lesson.applications.length === 0) warnings.push("No real-world applications listed.");

  if (!inRange(lesson.mistakes.length, LIMITS.mistakes)) {
    fail(`Provide ${LIMITS.mistakes.min}-${LIMITS.mistakes.max} common mistakes (got ${lesson.mistakes.length}).`);
  }
  lesson.mistakes.forEach((m, i) => {
    if (!m.mistake || !m.fix) fail(`Common mistake ${i + 1} needs both "mistake" and "fix".`);
  });

  if (!inRange(lesson.takeaways.length, LIMITS.takeaways)) {
    fail(`Provide ${LIMITS.takeaways.min}-${LIMITS.takeaways.max} key takeaways (got ${lesson.takeaways.length}).`);
  }
  if (countWords(lesson.revisionNotes) < 25) fail("Revision notes must be at least 25 words.");

  if (!inRange(lesson.practice.length, LIMITS.practice)) {
    fail(`Provide ${LIMITS.practice.min}-${LIMITS.practice.max} practice activities (got ${lesson.practice.length}).`);
  }
  lesson.practice.forEach((item, i) => {
    if (!PRACTICE_TYPES[item.type]) {
      fail(`Practice ${i + 1} has unknown type "${item.type}".`);
    } else if (profile && !profile.practiceTypes.includes(item.type)) {
      fail(`Practice ${i + 1} type "${item.type}" is not appropriate for a ${profile.label} course. Allowed: ${profile.practiceTypes.join(", ")}.`);
    }
    if (countWords(item.prompt) < 8) fail(`Practice ${i + 1} prompt must be at least 8 words.`);
    if (!hasSubstance(item.answer, 5)) fail(`Practice ${i + 1} needs a model answer of at least 5 words.`);
  });

  if (!inRange(lesson.assessment.length, LIMITS.assessment)) {
    fail(`Provide ${LIMITS.assessment.min}-${LIMITS.assessment.max} assessment questions (got ${lesson.assessment.length}).`);
  }
  checkQuestions(lesson.assessment, { fail, warnings, label: "Assessment question" });

  // Placeholder / filler text anywhere in the lesson.
  const fullText = JSON.stringify(lesson);
  const placeholder = findPlaceholder(fullText);
  if (placeholder) fail(`Lesson contains placeholder or template text (${placeholder}).`);

  // Relevance: the explanation should actually discuss the lesson topic.
  const titleTerms = meaningfulTerms(expectedTitle || lesson.title);
  const body = norm(lesson.explanation);
  if (titleTerms.some((term) => stem(term).length >= 3) && !mentions(body, titleTerms)) {
    warnings.push("Explanation never mentions the lesson's title terms.");
  }

  return { errors, warnings };
};

/* ---------- final assessment ---------- */

const normalizeFinalAssessment = (raw) => ({
  review: str(raw?.review),
  takeaways: strList(raw?.takeaways),
  revisionNotes: str(raw?.revisionNotes),
  questions: normalizeLesson({ assessment: raw?.questions }).assessment.map((q, i) => ({
    ...q,
    module: Number(raw?.questions?.[i]?.module) || 0,
  })),
});

// questionCount: requested number of questions; moduleCount: every module
// must be tested by at least one question.
const validateFinalAssessment = (final, { questionCount, moduleCount } = {}) => {
  const errors = [];
  const warnings = [];
  const fail = (message) => errors.push(message);

  const reviewWords = countWords(final.review);
  if (!inRange(reviewWords, LIMITS.finalReviewWords)) {
    fail(`The review must be ${LIMITS.finalReviewWords.min}-${LIMITS.finalReviewWords.max} words (got ${reviewWords}).`);
  }
  if (!inRange(final.takeaways.length, LIMITS.takeaways)) {
    fail(`Provide ${LIMITS.takeaways.min}-${LIMITS.takeaways.max} takeaways (got ${final.takeaways.length}).`);
  }
  if (countWords(final.revisionNotes) < 30) fail("revisionNotes must be at least 30 words.");

  const wanted = questionCount || LIMITS.finalQuestions.min;
  if (final.questions.length !== wanted) fail(`Provide exactly ${wanted} questions (got ${final.questions.length}).`);
  checkQuestions(final.questions, { fail, warnings, label: "Question" });

  if (moduleCount) {
    const tested = new Set(final.questions.map((q) => q.module));
    const untested = Array.from({ length: moduleCount }, (_, i) => i + 1).filter((m) => !tested.has(m));
    if (untested.length) fail(`Every module needs at least one question; none test module(s) ${untested.join(", ")}.`);
  }

  const placeholder = findPlaceholder(JSON.stringify(final));
  if (placeholder) fail(`Final assessment contains placeholder or template text (${placeholder}).`);

  return { errors, warnings };
};

/* ---------- course-wide checks ---------- */

// Detect near-duplicate lessons across the whole course. Returns a map of
// lesson key -> error message for lessons that duplicate an earlier one.
const findDuplicateLessons = (entries) => {
  const problems = new Map();
  const prepared = entries.map((entry) => ({ ...entry, set: shingles(entry.lesson.explanation) }));

  for (let i = 0; i < prepared.length; i++) {
    for (let j = 0; j < i; j++) {
      const score = similarity(prepared[i].set, prepared[j].set);
      if (score > LIMITS.duplicateSimilarity) {
        problems.set(
          prepared[i].key,
          `Explanation repeats "${prepared[j].lesson.title}" (${Math.round(score * 100)}% overlap); cover different material.`
        );
        break;
      }
    }
  }
  return problems;
};

const qualityScore = (warningCount) => Math.max(0, 100 - warningCount * 5);

/* ---------- existing course analysis ---------- */

// Decide whether an already-saved course needs (re)generation.
const analyzeExistingCourse = (course, { contentVersion }) => {
  const lessons = (course.modules || []).flatMap((m) => m.lessons || []);
  const reasons = [];

  if (!lessons.length) reasons.push("course has no lessons");

  const meta = course.contentMeta || {};
  if (meta.version !== contentVersion) {
    reasons.push(meta.version ? `content version ${meta.version} is outdated` : "content has never been enriched");
  }

  const missing = lessons.filter((l) => !l.learning || !l.learning.explanation).length;
  if (missing) reasons.push(`${missing}/${lessons.length} lessons have no structured content`);

  const placeholder = lessons.filter((l) => findPlaceholder(`${l.content || ""} ${l.description || ""}`)).length;
  if (placeholder) reasons.push(`${placeholder}/${lessons.length} lessons contain template placeholder text`);

  const thin = lessons.filter((l) => countWords(l.content) < 150).length;
  if (thin) reasons.push(`${thin}/${lessons.length} lessons have under 150 words`);

  return { needsEnrichment: reasons.length > 0, reasons, lessonCount: lessons.length };
};

module.exports = {
  LIMITS,
  normalizeCurriculum,
  normalizeLesson,
  validateCurriculum,
  validateLesson,
  normalizeFinalAssessment,
  validateFinalAssessment,
  findDuplicateLessons,
  qualityScore,
  analyzeExistingCourse,
  similarity,
};
