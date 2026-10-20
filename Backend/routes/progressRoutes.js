const express = require("express");
const router = express.Router();

const {
  getProgress,
  markLessonComplete,
  submitAssignment,
<<<<<<< HEAD
  submitLessonCheck,
  getMySubmissions,
} = require("../controllers/progressController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const uploadSubmissionPdf = require("../middleware/uploadSubmissionPdf");
=======
} = require("../controllers/progressController");

const { protect } = require("../middleware/authMiddleware");
>>>>>>> origin/main

// ===============================
// All routes require authentication
// ===============================

<<<<<<< HEAD
// Student: all of their own submissions across courses (status, file,
// marks, feedback). Declared before "/:courseId" so it is not read as an id.
router.get(
  "/submissions/mine",
  protect,
  authorizeRoles("student"),
  getMySubmissions
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
=======
// Get student's progress for a course
router.get("/:courseId", protect, getProgress);

// Mark a lesson as complete
router.post("/:courseId/complete", protect, markLessonComplete);

// Submit an assignment
router.post("/:courseId/submit", protect, submitAssignment);
>>>>>>> origin/main

module.exports = router;
