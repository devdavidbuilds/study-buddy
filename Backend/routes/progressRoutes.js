const express = require("express");
const router = express.Router();

const {
  getProgress,
  markLessonComplete,
  submitAssignment,
} = require("../controllers/progressController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// All routes require authentication
// ===============================

// Get student's progress for a course
router.get(
  "/:courseId",
  protect,
  authorizeRoles("student"),
  validateObjectId("courseId"),
  getProgress
);

// Mark a lesson as complete
router.post(
  "/:courseId/complete",
  protect,
  authorizeRoles("student"),
  validateObjectId("courseId"),
  markLessonComplete
);

// Submit an assignment
router.post(
  "/:courseId/submit",
  protect,
  authorizeRoles("student"),
  validateObjectId("courseId"),
  submitAssignment
);

module.exports = router;
