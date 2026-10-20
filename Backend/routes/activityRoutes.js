const express = require("express");
const router = express.Router();

const {
  logViewActivity,
  getMyActivity,
} = require("../controllers/activityController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ===============================
// All routes require authentication. Student identity is always taken
// from the authenticated JWT user (req.user), never from the request
// body/query — see activityController for enforcement.
// ===============================

// Get the authenticated student's own recent activity.
router.get("/me", protect, authorizeRoles("student"), getMyActivity);

// Record a course/lesson "opened" view event for the authenticated
// student. Restricted server-side to view-type activities only.
router.post("/view", protect, authorizeRoles("student"), logViewActivity);

module.exports = router;
