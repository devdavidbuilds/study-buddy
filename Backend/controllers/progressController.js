const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");

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
    const { moduleId, lessonId, title, answer } = req.body;

    if (!moduleId || !lessonId || !answer) {
      return res.status(400).json({
        success: false,
        message: "moduleId, lessonId, and answer are required.",
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

    // Find existing assignment entry or create new
    const existingIndex = progress.assignments.findIndex(
      (a) => a.moduleId === moduleId && a.lessonId === lessonId
    );

    const assignmentEntry = {
      moduleId,
      lessonId,
      title: title || "",
      answer,
      status: "Submitted",
      marks: 0,
      maxMarks: 10,
      submittedAt: new Date(),
      evaluatedAt: null,
      feedback: "",
    };

    if (existingIndex >= 0) {
      progress.assignments[existingIndex] = {
        ...progress.assignments[existingIndex],
        ...assignmentEntry,
      };
    } else {
      progress.assignments.push(assignmentEntry);
    }

    await progress.save();

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
