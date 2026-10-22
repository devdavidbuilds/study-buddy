const Enrollment = require("../models/Enrollment");

// ==============================
// Who may use a course's learning content.
//   admin   -> every course
//   faculty -> courses they own
//   student -> courses with an approved enrollment
// ==============================

const ENROLLMENT_REQUIRED_MESSAGE =
  "This course needs an approved enrollment. Request enrollment on the course page and wait for faculty approval.";

const isApprovedStudent = async (studentId, courseId) =>
  Boolean(await Enrollment.exists({ student: studentId, course: courseId, status: "approved" }));

// course must include `faculty` (id or populated).
const canAccessCourseContent = async (user, course) => {
  if (!user || !course) return false;
  if (user.role === "admin") return true;
  if (user.role === "faculty") return String(course.faculty?._id || course.faculty) === String(user._id);
  if (user.role === "student") return isApprovedStudent(user._id, course._id);
  return false;
};

// For student-only learning actions (complete, checks, quizzes, assignments).
// Sends 403 and returns false when the student is not enrolled.
const requireApprovedEnrollment = async (req, res, courseId) => {
  if (req.user?.role !== "student") return true;
  if (await isApprovedStudent(req.user._id, courseId)) return true;
  res.status(403).json({ success: false, code: "ENROLLMENT_REQUIRED", message: ENROLLMENT_REQUIRED_MESSAGE });
  return false;
};

module.exports = {
  ENROLLMENT_REQUIRED_MESSAGE,
  isApprovedStudent,
  canAccessCourseContent,
  requireApprovedEnrollment,
};
