const Course = require("../models/Course");
const StudentActivity = require("../models/StudentActivity");
const recordActivity = require("../utils/recordActivity");

// Only these two activity types may be created directly from a client
// request. Every other type (LESSON_COMPLETED, ASSIGNMENT_SUBMITTED,
// ASSIGNMENT_EVALUATED, quiz events) is only ever written internally by
// the controller that owns that state change, right after it succeeds —
// never from a request the client controls directly. This is what keeps
// this endpoint from being used to fabricate fake progress/grade activity.
const CLIENT_LOGGABLE_TYPES = ["COURSE_OPENED", "LESSON_OPENED"];

// Skip creating a duplicate "view" event if the same student viewed the
// same thing again within this window (e.g. quick back-and-forth
// navigation, a page refresh). Keeps the feed meaningful instead of noisy.
const VIEW_DEDUPE_WINDOW_MS = 5 * 60 * 1000;

// ==============================
// POST /api/activity/view
// Body: { activityType: 'COURSE_OPENED' | 'LESSON_OPENED', courseId, moduleId?, lessonId? }
//
// Records that the authenticated student opened a course or a lesson.
// ==============================
const logViewActivity = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { activityType, courseId, moduleId, lessonId } = req.body;

    if (!CLIENT_LOGGABLE_TYPES.includes(activityType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid activity type.",
      });
    }

    if (!courseId) {
      return res.status(400).json({
        success: false,
        message: "courseId is required.",
      });
    }

    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    let mod = null;
    let lesson = null;

    if (activityType === "LESSON_OPENED") {
      if (!moduleId || !lessonId) {
        return res.status(400).json({
          success: false,
          message: "moduleId and lessonId are required for LESSON_OPENED.",
        });
      }

      mod = (course.modules || []).find((m) => m.id === moduleId);

      if (!mod) {
        return res.status(400).json({
          success: false,
          message: "Module not found in this course.",
        });
      }

      lesson = (mod.lessons || []).find((l) => l.id === lessonId);

      if (!lesson) {
        return res.status(400).json({
          success: false,
          message: "Lesson not found in this module.",
        });
      }
    }

    // Dedupe rapid repeat views of the same thing.
    const recentDuplicate = await StudentActivity.findOne({
      student: studentId,
      activityType,
      course: courseId,
      moduleId: activityType === "LESSON_OPENED" ? moduleId : null,
      lessonId: activityType === "LESSON_OPENED" ? lessonId : null,
      createdAt: { $gte: new Date(Date.now() - VIEW_DEDUPE_WINDOW_MS) },
    }).lean();

    if (recentDuplicate) {
      return res.status(200).json({
        success: true,
        message: "Activity already recorded recently.",
        data: recentDuplicate,
      });
    }

    const activity = await recordActivity({
      studentId,
      activityType,
      courseId,
      moduleId: activityType === "LESSON_OPENED" ? moduleId : null,
      lessonId: activityType === "LESSON_OPENED" ? lessonId : null,
      metadata:
        activityType === "LESSON_OPENED"
          ? { courseName: course.courseName, lessonTitle: lesson?.title || "" }
          : { courseName: course.courseName },
    });

    res.status(201).json({
      success: true,
      message: "Activity recorded.",
      data: activity,
    });
  } catch (error) {
    console.error("Log View Activity Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// GET /api/activity/me
// Query: ?limit=20&courseId=<optional>
//
// SECURITY: always scoped to the authenticated student — a student can
// only ever see their own activity here. There is no route that accepts
// a studentId from the client to look up someone else's activity.
// ==============================
const getMyActivity = async (req, res) => {
  try {
    const studentId = req.user._id;
    const { courseId } = req.query;

    const limit = Math.min(
      Math.max(parseInt(req.query.limit, 10) || 20, 1),
      100
    );

    const filter = { student: studentId };
    if (courseId) filter.course = courseId;

    const activities = await StudentActivity.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("course", "courseName courseCode color")
      .populate("assignment", "title")
      .populate("quiz", "title")
      .lean();

    res.status(200).json({
      success: true,
      count: activities.length,
      data: activities,
    });
  } catch (error) {
    console.error("Get My Activity Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  logViewActivity,
  getMyActivity,
};
