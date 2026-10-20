const express = require("express");
const router = express.Router();

const { getSubmissionFile } = require("../controllers/submissionFileController");
const { protect } = require("../middleware/authMiddleware");

// ===============================
// Protected Routes
// ===============================

// Stream a submitted assignment PDF (owner student, course faculty, admin —
// enforced in the controller)
router.get("/files/:fileId", protect, getSubmissionFile);

module.exports = router;
