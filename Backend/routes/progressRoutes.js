const express = require("express");
const router = express.Router();

const {
  getProgress,
  markLessonComplete,
  submitAssignment,
} = require("../controllers/progressController");

const { protect } = require("../middleware/authMiddleware");

// ===============================
// All routes require authentication
// ===============================

// Get student's progress for a course
router.get("/:courseId", protect, getProgress);

// Mark a lesson as complete
router.post("/:courseId/complete", protect, markLessonComplete);

// Submit an assignment
router.post("/:courseId/submit", protect, submitAssignment);

module.exports = router;
