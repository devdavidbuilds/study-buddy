const Quiz = require("../models/Quiz");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const recordActivity = require("../utils/recordActivity");
const { requireApprovedEnrollment } = require("../utils/enrollment");

// ==============================
// Helper: validate a raw questions array from the request body.
// Returns { valid, message } — never trusts client-supplied totals.
// ==============================
const validateQuestions = (questions) => {
  if (!Array.isArray(questions) || questions.length === 0) {
    return { valid: false, message: "At least one question is required." };
  }

  for (let i = 0; i < questions.length; i++) {
    const q = questions[i] || {};
    const num = i + 1;

    if (!q.questionText || !String(q.questionText).trim()) {
      return { valid: false, message: `Question ${num}: question text is required.` };
    }

    const options = Array.isArray(q.options) ? q.options : [];
    if (options.length !== 4) {
      return { valid: false, message: `Question ${num}: exactly 4 options are required.` };
    }
    if (options.some((o) => !o || !String(o).trim())) {
      return { valid: false, message: `Question ${num}: all 4 options must be filled in.` };
    }

    const correctIndex = Number(q.correctAnswerIndex);
    if (
      q.correctAnswerIndex === undefined ||
      q.correctAnswerIndex === null ||
      Number.isNaN(correctIndex) ||
      !Number.isInteger(correctIndex) ||
      correctIndex < 0 ||
      correctIndex > 3
    ) {
      return {
        valid: false,
        message: `Question ${num}: exactly one correct answer must be selected.`,
      };
    }

    const marks = Number(q.marks);
    if (Number.isNaN(marks) || marks <= 0) {
      return { valid: false, message: `Question ${num}: marks must be a positive value.` };
    }
  }

  return { valid: true };
};

// ==============================
// Create Quiz
// POST /api/quizzes/create
// ==============================
const createQuiz = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { title, courseId, moduleId, lessonId, questions, timeLimit, status } =
      req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: "Quiz title is required.",
      });
    }

    if (!courseId || !moduleId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "courseId, moduleId, and lessonId are required.",
      });
    }

    // Validate the course exists and belongs to this faculty. Ownership is
    // always resolved from the authenticated JWT user, never from the body.
    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    if (String(course.faculty) !== String(facultyId)) {
      return res.status(403).json({
        success: false,
        message: "You can only create quizzes for your own courses.",
      });
    }

    // Validate module and lesson exist in the course
    const mod = (course.modules || []).find((m) => m.id === moduleId);
    if (!mod) {
      return res.status(400).json({
        success: false,
        message: "Module not found in this course.",
      });
    }

    const lesson = (mod.lessons || []).find((l) => l.id === lessonId);
    if (!lesson) {
      return res.status(400).json({
        success: false,
        message: "Lesson not found in this module.",
      });
    }

    // Validate questions
    const questionCheck = validateQuestions(questions);
    if (!questionCheck.valid) {
      return res.status(400).json({
        success: false,
        message: questionCheck.message,
      });
    }

    // Validate optional time limit
    let cleanTimeLimit = null;
    if (timeLimit !== undefined && timeLimit !== null && timeLimit !== "") {
      const t = Number(timeLimit);
      if (Number.isNaN(t) || t <= 0) {
        return res.status(400).json({
          success: false,
          message: "Time limit must be a positive number of minutes.",
        });
      }
      cleanTimeLimit = t;
    }

    // Normalize questions server-side (never trust client-computed totals)
    const cleanQuestions = questions.map((q) => ({
      questionText: String(q.questionText).trim(),
      options: q.options.map((o) => String(o).trim()),
      correctAnswerIndex: Number(q.correctAnswerIndex),
      marks: Number(q.marks),
    }));

    const totalMarks = cleanQuestions.reduce((sum, q) => sum + q.marks, 0);

    const quiz = await Quiz.create({
      title: title.trim(),
      course: courseId,
      moduleId,
      lessonId,
      faculty: facultyId,
      questions: cleanQuestions,
      timeLimit: cleanTimeLimit,
      totalMarks,
      status: status || "Published",
    });

    res.status(201).json({
      success: true,
      message: "Quiz created successfully.",
      data: quiz,
    });
  } catch (error) {
    console.error("Create Quiz Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Quizzes for a Course (faculty's own course only)
// GET /api/quizzes/course/:courseId
// ==============================
const getQuizzesByCourse = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { courseId } = req.params;

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    if (String(course.faculty) !== String(facultyId)) {
      return res.status(403).json({
        success: false,
        message: "You can only view quizzes for your own courses.",
      });
    }

    const quizzes = await Quiz.find({ course: courseId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    console.error("Get Quizzes By Course Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Quizzes for a specific Module/Lesson (faculty's own course only)
// GET /api/quizzes/course/:courseId/module/:moduleId/lesson/:lessonId
// ==============================
const getQuizzesForLesson = async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    if (req.user.role !== "student" && String(course.faculty) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You can only view quizzes for your own courses.",
      });
    }

    const query = {
      course: courseId,
      moduleId,
      lessonId,
      ...(req.user.role === "student" ? { status: "Published" } : {}),
    };
    const quizzes = await Quiz.find(query)
      .sort({ createdAt: -1 })
      .lean();

    const safeQuizzes = req.user.role === "student"
      ? quizzes.map(({ questions, ...quiz }) => ({
          ...quiz,
          questions: questions.map(({ questionText, options, marks }) => ({
            questionText,
            options,
            marks,
          })),
        }))
      : quizzes;

    res.status(200).json({
      success: true,
      count: safeQuizzes.length,
      data: safeQuizzes,
    });
  } catch (error) {
    console.error("Get Quizzes For Lesson Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Submit a student quiz attempt
// POST /api/quizzes/course/:courseId/:quizId/submit
// ==============================
const submitQuiz = async (req, res) => {
  try {
    const { courseId, quizId } = req.params;
    const { moduleId, lessonId, answers } = req.body;

    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Only students can submit quiz attempts." });
    }

    const quiz = await Quiz.findOne({
      _id: quizId,
      course: courseId,
      moduleId,
      lessonId,
      status: "Published",
    }).lean();

    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found for this lesson." });
    }

    if (!(await requireApprovedEnrollment(req, res, courseId))) return;

    if (!Array.isArray(answers) || answers.length !== quiz.questions.length ||
        answers.some((answer) => !Number.isInteger(answer) || answer < 0 || answer > 3)) {
      return res.status(400).json({ success: false, message: "Please answer every quiz question." });
    }

    const correctAnswers = answers.reduce(
      (total, answer, index) => total + (answer === quiz.questions[index].correctAnswerIndex ? 1 : 0),
      0
    );
    const incorrectAnswers = quiz.questions.length - correctAnswers;
    const score = quiz.questions.reduce(
      (total, question, index) => total + (answers[index] === question.correctAnswerIndex ? question.marks : 0),
      0
    );
    const percentage = quiz.totalMarks > 0 ? Math.round((score / quiz.totalMarks) * 100) : 0;
    const attempt = {
      quiz: quiz._id,
      moduleId,
      lessonId,
      score,
      totalMarks: quiz.totalMarks,
      percentage,
      correctAnswers,
      incorrectAnswers,
      totalQuestions: quiz.questions.length,
      submittedAt: new Date(),
    };

    let progress = await CourseProgress.findOne({ user: req.user._id, course: courseId });
    if (!progress) {
      progress = new CourseProgress({ user: req.user._id, course: courseId });
    }
    const existingIndex = progress.quizAttempts.findIndex((entry) => String(entry.quiz) === String(quiz._id));
    if (existingIndex >= 0) progress.quizAttempts[existingIndex] = attempt;
    else progress.quizAttempts.push(attempt);
    await progress.save();

    recordActivity({
      studentId: req.user._id,
      activityType: "QUIZ_COMPLETED",
      courseId,
      moduleId,
      lessonId,
      quizId: quiz._id,
      metadata: { title: quiz.title, score, percentage },
    });

    return res.status(200).json({
      success: true,
      message: "Quiz submitted successfully.",
      data: { title: quiz.title, ...attempt },
    });
  } catch (error) {
    console.error("Submit Quiz Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ==============================
// Get Quizzes created by the logged-in Faculty
// GET /api/quizzes/my
// ==============================
const getMyQuizzes = async (req, res) => {
  try {
    const facultyId = req.user._id;

    const quizzes = await Quiz.find({ faculty: facultyId })
      .populate("course", "courseName courseCode")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes,
    });
  } catch (error) {
    console.error("Get My Quizzes Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createQuiz,
  getQuizzesByCourse,
  getQuizzesForLesson,
  submitQuiz,
  getMyQuizzes,
};
