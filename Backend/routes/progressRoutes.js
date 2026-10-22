const express = require("express");
const router = express.Router();

const {
  getProgress,
  markLessonComplete,
  submitAssignment,
  submitLessonCheck,
  getMySubmissions,
} = require("../controllers/progressController");
const { getLearningSummary } = require("../controllers/summaryController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const uploadSubmissionPdf = require("../middleware/uploadSubmissionPdf");

// ===============================
// All routes require authentication
// ===============================

// Student: all of their own submissions across courses (status, file,
// marks, feedback). Declared before "/:courseId" so it is not read as an id.
router.get(
  "/submissions/mine",
  protect,
  authorizeRoles("student"),
  getMySubmissions
);

// Student: dashboard summary (courses, streak, XP, activity, goals,
// badges, leaderboard). Also declared before "/:courseId".
router.get(
  "/summary",
  protect,
  authorizeRoles("student"),
  getLearningSummary
);

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

// Submit an assignment (JSON, or multipart with an optional PDF in "file")
router.post(
  "/:courseId/submit",
  protect,
  authorizeRoles("student"),
  validateObjectId("courseId"),
  uploadSubmissionPdf,
  submitAssignment
);

// Submit a lesson's built-in check (scored server-side)
router.post(
  "/:courseId/lesson-check",
  protect,
  authorizeRoles("student"),
  validateObjectId("courseId"),
  submitLessonCheck
);

module.exports = router;
