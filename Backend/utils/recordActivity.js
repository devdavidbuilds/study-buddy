const StudentActivity = require("../models/StudentActivity");

// ==============================
// recordActivity
//
// Internal helper (NOT an HTTP route) used by other controllers to write
// a StudentActivity entry right after an authoritative state change
// (e.g. a lesson was just marked complete). This keeps the logging call
// a single line at each integration point and keeps the shape of a
// record consistent everywhere it's created.
//
// This never trusts a studentId passed from a request body — callers
// must always pass the id resolved from the authenticated JWT user
// (req.user._id) or, for the evaluation flow, the owning student of the
// progress record being evaluated (already resolved server-side).
//
// Activity logging is best-effort: a logging failure must never break
// the underlying learning flow (lesson completion, submission, etc.), so
// this swallows and logs its own errors instead of throwing.
// ==============================
const recordActivity = async ({
  studentId,
  activityType,
  courseId = null,
  moduleId = null,
  lessonId = null,
  assignmentId = null,
  quizId = null,
  metadata = {},
}) => {
  try {
    if (!studentId || !activityType) return null;

    return await StudentActivity.create({
      student: studentId,
      activityType,
      course: courseId,
      moduleId,
      lessonId,
      assignment: assignmentId,
      quiz: quizId,
      metadata,
    });
  } catch (error) {
    console.error("Record Activity Error:", error.message);
    return null;
  }
};

module.exports = recordActivity;
