const express = require("express");
const router = express.Router();

const {
  getCourseProgressOverview,
  getStudentProgressDetail,
} = require("../controllers/facultyProgressController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// Faculty Student Progress + Analytics
//
// All routes require an authenticated faculty/admin user. Course
// ownership (course.faculty === req.user._id) is verified inside the
// controller for every request — a faculty member can never view
// another faculty member's course analytics by changing the courseId,
// and students cannot reach these routes at all (authorizeRoles).
// ===============================

// Course-level analytics + student list for a course the faculty owns.
router.get(
  "/:courseId/progress",
  protect,
  authorizeRoles("faculty", "admin"),
  validateObjectId("courseId"),
  getCourseProgressOverview
);

// Single student's detailed progress within a course the faculty owns.
router.get(
  "/:courseId/students/:studentId/progress",
  protect,
  authorizeRoles("faculty", "admin"),
  validateObjectId("courseId"),
  validateObjectId("studentId"),
  getStudentProgressDetail
);

module.exports = router;
