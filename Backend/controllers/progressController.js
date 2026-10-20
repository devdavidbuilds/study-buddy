const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Assignment = require("../models/Assignment");
const recordActivity = require("../utils/recordActivity");

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

    const totalLessons = countTotalLessons(course);

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
      };
    }

    const completedCount = progress.completedLessons.length;
    const percentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    res.status(200).json({
      success: true,
      data: {
        ...progress,
        completedCount,
        totalLessons,
        percentage,
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

    const totalLessons = countTotalLessons(course);
    const completedCount = progress.completedLessons.length;
    const percentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

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
const submitAssignment = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.params;
    const { moduleId, lessonId, title, answer, assignmentId, answers } =
      req.body;

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

      // Prevent invalid/empty submissions.
      if (questionCount > 0) {
        const allAnswered =
          submittedAnswers.length === questionCount &&
          submittedAnswers.every(
            (a) => typeof a === "string" && a.trim().length > 0
          );

        if (!allAnswered) {
          return res.status(400).json({
            success: false,
            message: "Please answer every question before submitting.",
          });
        }
      } else if (
        submittedAnswers.length === 0 ||
        !submittedAnswers.some((a) => typeof a === "string" && a.trim())
      ) {
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
        answers: submittedAnswers.map((a) => (a || "").trim()),
        status: "Submitted",
        marks: 0,
        maxMarks: assignment.totalMarks || 10,
        submittedAt: new Date(),
        evaluatedAt: null,
        feedback: "",
      };
    } else {
      // ── Legacy auto-generated lesson-prompt flow ──
      if (!answer || !answer.trim()) {
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
        answer: answer.trim(),
        answers: [],
        status: "Submitted",
        marks: 0,
        maxMarks: 10,
        submittedAt: new Date(),
        evaluatedAt: null,
        feedback: "",
      };
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
      });
    }

    // Find existing entry for this lesson (resubmission) or create new
    const existingIndex = progress.assignments.findIndex(
      (a) => a.moduleId === moduleId && a.lessonId === lessonId
    );

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
  }
};

module.exports = {
  getProgress,
  markLessonComplete,
  submitAssignment,
};
