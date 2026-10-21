const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Assignment = require("../models/Assignment");
const User = require("../models/User");
const recordActivity = require("../utils/recordActivity");
const { issueCertificate } = require("../utils/certificates");
const {
  cleanOriginalName,
  fileUrlFor,
  removeFile,
  persistUpload,
  removeStoredFile,
} = require("../utils/submissionFiles");

const SUBMITTED_STATUSES = ["Submitted", "Evaluated", "Returned"];

const findLessonInCourse = (course, moduleId, lessonId) => {
  const module = (course.modules || []).find((entry) => entry.id === moduleId);
  if (!module) return { module: null, lesson: null };
  return {
    module,
    lesson: (module.lessons || []).find((entry) => entry.id === lessonId) || null,
  };
};

// ==============================
// Helper: count total lessons
// ==============================
const countTotalLessons = (course) => {
  if (!Array.isArray(course?.modules)) return 0;

  return course.modules.reduce((total, mod) => {
    return total + (Array.isArray(mod?.lessons) ? mod.lessons.length : 0);
  }, 0);
};

// ==============================
// Helper: completions that still match a lesson in the course.
// Completion records are never deleted, but if a course's structure
// changes, entries for lessons that no longer exist must not inflate the
// percentage (e.g. 12 old completions on a 10-lesson course = 120%).
// ==============================
const countValidCompletions = (course, completedLessons = []) => {
  const valid = new Set();
  (course?.modules || []).forEach((mod) =>
    (mod.lessons || []).forEach((lesson) => valid.add(`${mod.id}::${lesson.id}`))
  );
  return new Set(
    completedLessons
      .map((entry) => `${entry.moduleId}::${entry.lessonId}`)
      .filter((key) => valid.has(key))
  ).size;
};

const progressSummary = (course, completedLessons) => {
  const totalLessons = countTotalLessons(course);
  const completedCount = countValidCompletions(course, completedLessons);
  const percentage =
    totalLessons > 0 ? Math.min(100, Math.round((completedCount / totalLessons) * 100)) : 0;
  return { totalLessons, completedCount, percentage };
};

// Structured (pipeline-generated) lessons require the lesson check before
// they can be completed; legacy lessons keep their existing flow.
const requiresLessonCheck = (lesson) =>
  Boolean(lesson?.learning?.explanation) && Array.isArray(lesson.quiz) && lesson.quiz.length > 0;

// ==============================
// GET  /api/progress/:courseId
// ==============================
const getProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;

    // Validate course exists and get lesson count
    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // Find or return empty progress
    let progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    }).lean();

    if (!progress) {
      progress = {
        user: userId,
        course: courseId,
        completedLessons: [],
        assignments: [],
        quizAttempts: [],
        lessonChecks: [],
      };
    }

    const { totalLessons, completedCount, percentage } = progressSummary(
      course,
      progress.completedLessons
    );

    // Also backfills certificates for courses finished before they existed.
    const certificate =
      percentage === 100 && totalLessons > 0
        ? await issueCertificate({ studentId: userId, course, totalLessons })
        : null;

    res.status(200).json({
      success: true,
      data: {
        ...progress,
        completedCount,
        totalLessons,
        percentage,
        certificate,
      },
    });
  } catch (error) {
    console.error("Get Progress Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// POST /api/progress/:courseId/complete
// ==============================
const markLessonComplete = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    const { moduleId, lessonId } = req.body;

    if (!moduleId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "moduleId and lessonId are required.",
      });
    }

    // Validate course exists
    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const { module, lesson } = findLessonInCourse(course, moduleId, lessonId);
    if (!module || !lesson) {
      return res.status(400).json({
        success: false,
        message: "Module and lesson must belong to this course.",
      });
    }

    // Upsert progress document
    let progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    });

    if (!progress) {
      progress = new CourseProgress({
        user: userId,
        course: courseId,
        completedLessons: [],
        assignments: [],
        quizAttempts: [],
      });
    }

    // Check if already completed
    const alreadyDone = progress.completedLessons.some(
      (entry) => entry.moduleId === moduleId && entry.lessonId === lessonId
    );

    if (!alreadyDone && requiresLessonCheck(lesson)) {
      const checked = (progress.lessonChecks || []).some(
        (entry) => entry.moduleId === moduleId && entry.lessonId === lessonId
      );
      if (!checked) {
        return res.status(400).json({
          success: false,
          message: "Complete the lesson check before marking this lesson complete.",
        });
      }
    }

    if (!alreadyDone) {
      progress.completedLessons.push({
        moduleId,
        lessonId,
        completedAt: new Date(),
      });
    }

    await progress.save();

    // Only log a new activity the first time this lesson is completed —
    // re-hitting this endpoint for an already-completed lesson is a no-op
    // and shouldn't create a duplicate history entry.
    if (!alreadyDone) {
      recordActivity({
        studentId: userId,
        activityType: "LESSON_COMPLETED",
        courseId,
        moduleId,
        lessonId,
        metadata: { courseName: course.courseName },
      });
    }

    const { totalLessons, completedCount, percentage } = progressSummary(
      course,
      progress.completedLessons
    );

    const certificate =
      percentage === 100 && totalLessons > 0
        ? await issueCertificate({ studentId: userId, course, totalLessons })
        : null;

    res.status(200).json({
      success: true,
      message: alreadyDone
        ? "Lesson was already marked complete."
        : "Lesson marked complete.",
      data: {
        completedLessons: progress.completedLessons,
        completedCount,
        totalLessons,
        percentage,
        certificate,
      },
    });
  } catch (error) {
    console.error("Mark Complete Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// POST /api/progress/:courseId/submit
// ==============================
// Accepts JSON, or multipart/form-data with an optional PDF in "file"
// (see middleware/uploadSubmissionPdf). In multipart requests `answers`
// arrives as a JSON-encoded string.
const submitAssignment = async (req, res) => {
  // The uploaded PDF (if any) is deleted unless the submission is saved.
  let keepUpload = false;
  let persistedFile = null;

  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    const { moduleId, lessonId, title, answer, assignmentId } = req.body || {};
    let { answers } = req.body || {};

    if (typeof answers === "string") {
      try {
        answers = JSON.parse(answers);
      } catch {
        return res.status(400).json({ success: false, message: "answers must be a JSON array." });
      }
    }
    if (answers !== undefined && answers !== null && !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: "answers must be an array." });
    }

    const uploadedFile = req.file
      ? {
          fileId: req.file.fileId,
          originalName: cleanOriginalName(req.file.originalname),
          size: req.file.size,
          mimeType: "application/pdf",
          url: fileUrlFor(req.file.fileId),
          uploadedAt: new Date(),
        }
      : null;

    if (!moduleId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "moduleId and lessonId are required.",
      });
    }

    // Validate course exists
    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const { module, lesson } = findLessonInCourse(course, moduleId, lessonId);
    if (!module || !lesson) {
      return res.status(400).json({
        success: false,
        message: "Module and lesson must belong to this course.",
      });
    }

    // Load the student's progress up front: a resubmission may keep the PDF
    // that was uploaded earlier.
    let progress = await CourseProgress.findOne({
      user: userId,
      course: courseId,
    });

    const findExistingIndex = (entryAssignmentId) =>
      progress
        ? progress.assignments.findIndex((a) =>
            entryAssignmentId
              ? String(a.assignmentId) === String(entryAssignmentId)
              : !a.assignmentId && a.moduleId === moduleId && a.lessonId === lessonId
          )
        : -1;

    let assignmentEntry;

    if (assignmentId) {
      // ── Real, faculty-created assignment flow ──
      const assignment = await Assignment.findById(assignmentId).lean();

      if (!assignment) {
        return res.status(404).json({
          success: false,
          message: "Assignment not found.",
        });
      }

      if (
        String(assignment.course) !== String(courseId) ||
        assignment.moduleId !== moduleId ||
        assignment.lessonId !== lessonId
      ) {
        return res.status(400).json({
          success: false,
          message: "Assignment does not match the given course/module/lesson.",
        });
      }

      if (assignment.status !== "Published") {
        return res.status(400).json({
          success: false,
          message: "This assignment is not available for submissions.",
        });
      }

      const questionCount = Array.isArray(assignment.questions)
        ? assignment.questions.length
        : 0;
      const submittedAnswers = Array.isArray(answers) ? answers : [];
      const previous = progress?.assignments[findExistingIndex(assignment._id)];
      const hasPdf = Boolean(uploadedFile || previous?.file?.fileId);

      if (submittedAnswers.some((a) => typeof a !== "string") || submittedAnswers.length > Math.max(questionCount, 1)) {
        return res.status(400).json({
          success: false,
          message: "Answers must be text, one per question.",
        });
      }

      // Prevent invalid/empty submissions. A PDF can stand in for typed
      // answers (e.g. a worked solution); any typed answers are kept too.
      if (questionCount > 0) {
        const allAnswered =
          submittedAnswers.length === questionCount &&
          submittedAnswers.every((a) => a.trim().length > 0);

        if (!allAnswered && !hasPdf) {
          return res.status(400).json({
            success: false,
            message: "Please answer every question or attach your work as a PDF before submitting.",
          });
        }
      } else if (!submittedAnswers.some((a) => a.trim()) && !hasPdf) {
        return res.status(400).json({
          success: false,
          message: "Your submission cannot be empty.",
        });
      }

      assignmentEntry = {
        moduleId,
        lessonId,
        assignmentId: assignment._id,
        title: assignment.title || "",
        answer: "",
        answers: questionCount > 0
          ? Array.from({ length: questionCount }, (_, i) => (submittedAnswers[i] || "").trim())
          : submittedAnswers.map((a) => a.trim()),
        status: "Submitted",
        marks: 0,
        maxMarks: assignment.totalMarks || 10,
        submittedAt: new Date(),
        evaluatedAt: null,
        evaluatedBy: null,
        feedback: "",
      };
    } else {
      // ── Legacy auto-generated lesson-prompt flow ──
      const previous = progress?.assignments[findExistingIndex(null)];
      const hasPdf = Boolean(uploadedFile || previous?.file?.fileId);
      const text = typeof answer === "string" ? answer.trim() : "";

      if (!text && !hasPdf) {
        return res.status(400).json({
          success: false,
          message: "answer is required.",
        });
      }

      assignmentEntry = {
        moduleId,
        lessonId,
        assignmentId: null,
        title: title || "",
        answer: text,
        answers: [],
        status: "Submitted",
        marks: 0,
        maxMarks: 10,
        submittedAt: new Date(),
        evaluatedAt: null,
        evaluatedBy: null,
        feedback: "",
      };
    }

    // An evaluated submission is final; faculty can return it for
    // resubmission, which re-opens it ("Returned").
    const previousEntry = progress?.assignments[findExistingIndex(assignmentEntry.assignmentId)];
    if (previousEntry?.status === "Evaluated") {
      return res.status(409).json({
        success: false,
        message: "This assignment has already been evaluated. Ask your faculty to return it if you need to resubmit.",
      });
    }

    if (uploadedFile) {
      uploadedFile.storage = await persistUpload(req.file, {
        studentId: String(userId),
        courseId: String(courseId),
        assignmentId: assignmentEntry.assignmentId ? String(assignmentEntry.assignmentId) : null,
      });
      persistedFile = uploadedFile;
      assignmentEntry.file = uploadedFile;
    }

    // Upsert progress document
    if (!progress) {
      progress = new CourseProgress({
        user: userId,
        course: courseId,
        completedLessons: [],
        assignments: [],
      });
    }

    // Find this exact submission's existing entry (resubmission) or create
    // a new one. Faculty assignments are matched by assignmentId so two
    // assignments on the same lesson never overwrite each other; the
    // legacy lesson prompt (no assignmentId) is matched by lesson.
    const existingIndex = findExistingIndex(assignmentEntry.assignmentId);
    // A new PDF replaces the old one; without a new upload the earlier PDF
    // stays attached to the resubmission.
    const replacedFile =
      existingIndex >= 0 && uploadedFile && progress.assignments[existingIndex].file
        ? progress.assignments[existingIndex].file.toObject()
        : null;

    if (existingIndex >= 0) {
      // Resubmitting: keep prior marks/feedback history off, reset to a
      // fresh "Submitted" state so faculty re-review it.
      progress.assignments[existingIndex] = {
        ...progress.assignments[existingIndex].toObject(),
        ...assignmentEntry,
      };
    } else {
      progress.assignments.push(assignmentEntry);
    }

    await progress.save();
    keepUpload = true;
    if (replacedFile && replacedFile.fileId !== uploadedFile?.fileId) removeStoredFile(replacedFile);

    recordActivity({
      studentId: userId,
      activityType: "ASSIGNMENT_SUBMITTED",
      courseId,
      moduleId,
      lessonId,
      assignmentId: assignmentEntry.assignmentId || null,
      metadata: {
        courseName: course.courseName,
        title: assignmentEntry.title || "",
        resubmission: existingIndex >= 0,
        hasPdf: Boolean(uploadedFile),
      },
    });

    res.status(200).json({
      success: true,
      message: "Assignment submitted successfully.",
      data: {
        assignments: progress.assignments,
      },
    });
  } catch (error) {
    console.error("Submit Assignment Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  } finally {
    if (req.file && !keepUpload) {
      removeFile(req.file.path);
      if (persistedFile) removeStoredFile(persistedFile);
    }
  }
};

// ==============================
// POST /api/progress/:courseId/lesson-check
// Body: { moduleId, lessonId, answers: [optionIndex, ...] }
//
// Scores the lesson's built-in assessment (lesson.quiz) on the server —
// answer keys never reach the browser before submission. Returns which
// answers were right plus explanations, and stores one entry per lesson
// (a retake replaces the previous score and increments `attempts`).
// ==============================
const submitLessonCheck = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    const { moduleId, lessonId, answers } = req.body || {};

    if (!moduleId || !lessonId) {
      return res.status(400).json({ success: false, message: "moduleId and lessonId are required." });
    }

    const course = await Course.findById(courseId).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const { module, lesson } = findLessonInCourse(course, moduleId, lessonId);
    if (!module || !lesson) {
      return res.status(400).json({ success: false, message: "Module and lesson must belong to this course." });
    }

    const questions = Array.isArray(lesson.quiz) ? lesson.quiz : [];
    if (!questions.length) {
      return res.status(400).json({ success: false, message: "This lesson has no lesson check." });
    }

    if (
      !Array.isArray(answers) ||
      answers.length !== questions.length ||
      answers.some(
        (answer, index) =>
          !Number.isInteger(answer) || answer < 0 || answer >= (questions[index].options || []).length
      )
    ) {
      return res.status(400).json({ success: false, message: "Please answer every question." });
    }

    const results = questions.map((question, index) => {
      const correctIndex = (question.options || []).indexOf(question.answer);
      return {
        correct: correctIndex >= 0 && answers[index] === correctIndex,
        correctIndex,
        explanation: question.explanation || "",
      };
    });
    const correct = results.filter((r) => r.correct).length;
    const percentage = Math.round((correct / questions.length) * 100);

    let progress = await CourseProgress.findOne({ user: userId, course: courseId });
    if (!progress) {
      progress = new CourseProgress({ user: userId, course: courseId });
    }

    const existingIndex = progress.lessonChecks.findIndex(
      (entry) => entry.moduleId === moduleId && entry.lessonId === lessonId
    );
    const entry = {
      moduleId,
      lessonId,
      answers,
      correct,
      total: questions.length,
      percentage,
      attempts: existingIndex >= 0 ? (progress.lessonChecks[existingIndex].attempts || 1) + 1 : 1,
      submittedAt: new Date(),
    };
    if (existingIndex >= 0) progress.lessonChecks[existingIndex] = entry;
    else progress.lessonChecks.push(entry);

    await progress.save();

    recordActivity({
      studentId: userId,
      activityType: "QUIZ_COMPLETED",
      courseId,
      moduleId,
      lessonId,
      metadata: { kind: "lesson-check", title: lesson.title, correct, total: questions.length, percentage },
    });

    res.status(200).json({
      success: true,
      message: "Lesson check submitted.",
      data: { ...entry, results },
    });
  } catch (error) {
    console.error("Lesson Check Error:", error);
    res.status(500).json({ success: false, message: "Could not score the lesson check." });
  }
};

// ==============================
// GET /api/progress/submissions/mine
// The logged-in student's own submissions across all courses.
// ==============================
const getMySubmissions = async (req, res) => {
  try {
    const progressDocs = await CourseProgress.find({ user: req.user._id }, { course: 1, assignments: 1 })
      .populate("course", "courseName courseCode category")
      .lean();

    const entries = progressDocs.flatMap((progress) =>
      (progress.assignments || [])
        .filter((a) => SUBMITTED_STATUSES.includes(a.status))
        .map((a) => ({ progress, entry: a }))
    );

    const evaluatorIds = [...new Set(entries.map(({ entry }) => entry.evaluatedBy).filter(Boolean).map(String))];
    const evaluators = evaluatorIds.length
      ? await User.find({ _id: { $in: evaluatorIds } }).select("fullName").lean()
      : [];
    const evaluatorNameById = new Map(evaluators.map((u) => [String(u._id), u.fullName]));

    const assignmentIds = entries.map(({ entry }) => entry.assignmentId).filter(Boolean);
    const assignments = assignmentIds.length
      ? await Assignment.find({ _id: { $in: assignmentIds } }).select("title dueDate totalMarks").lean()
      : [];
    const assignmentById = new Map(assignments.map((a) => [String(a._id), a]));

    // Published faculty assignments in the student's courses that they have
    // not submitted yet are listed as "Pending".
    const submittedIds = new Set(entries.map(({ entry }) => String(entry.assignmentId)).filter(Boolean));
    const courseById = new Map(progressDocs.filter((p) => p.course?._id).map((p) => [String(p.course._id), p.course]));
    const open = courseById.size
      ? await Assignment.find({ course: { $in: [...courseById.keys()] }, status: "Published" })
          .select("title dueDate totalMarks course moduleId lessonId")
          .lean()
      : [];
    const pending = open
      .filter((a) => !submittedIds.has(String(a._id)))
      .map((a) => {
        const course = courseById.get(String(a.course)) || {};
        return {
          courseId: a.course,
          courseName: course.courseName || "Course",
          courseCode: course.courseCode || "",
          category: course.category || "",
          moduleId: a.moduleId,
          lessonId: a.lessonId,
          assignmentId: a._id,
          title: a.title,
          dueDate: a.dueDate || null,
          status: "Pending",
          submittedAt: null,
          evaluatedAt: null,
          marks: null,
          maxMarks: a.totalMarks,
          feedback: "",
          file: null,
        };
      });

    const submitted = entries
      .map(({ progress, entry }) => {
        const assignment = entry.assignmentId ? assignmentById.get(String(entry.assignmentId)) : null;
        return {
          courseId: progress.course?._id || progress.course,
          courseName: progress.course?.courseName || "Course",
          courseCode: progress.course?.courseCode || "",
          category: progress.course?.category || "",
          moduleId: entry.moduleId,
          lessonId: entry.lessonId,
          assignmentId: entry.assignmentId || null,
          title: assignment?.title || entry.title || "Lesson assignment",
          dueDate: assignment?.dueDate || null,
          status: entry.status,
          submittedAt: entry.submittedAt,
          evaluatedAt: entry.evaluatedAt,
          marks: entry.status === "Evaluated" ? entry.marks : null,
          maxMarks: entry.maxMarks,
          feedback: entry.status === "Evaluated" || entry.status === "Returned" ? entry.feedback || "" : "",
          evaluatedByName: entry.evaluatedBy ? evaluatorNameById.get(String(entry.evaluatedBy)) || "Faculty" : "",
          file: entry.file || null,
        };
      })
      .sort((a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0));

    // Pending first (soonest due date first), then submissions, newest first.
    pending.sort((a, b) => (a.dueDate ? new Date(a.dueDate) : Infinity) - (b.dueDate ? new Date(b.dueDate) : Infinity));
    const data = [...pending, ...submitted];

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Get My Submissions Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getProgress,
  markLessonComplete,
  submitAssignment,
  submitLessonCheck,
  getMySubmissions,
};
