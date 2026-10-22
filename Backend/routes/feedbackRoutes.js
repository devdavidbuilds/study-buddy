const express = require("express");
const router = express.Router();

const {
  getCourseFeedback,
  saveMyFeedback,
  deleteMyFeedback,
  toggleHelpful,
  getFacultyFeedback,
  replyToFeedback,
  deleteReply,
} = require("../controllers/feedbackController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// Course feedback: enrolled students rate and comment, other students mark
// feedback helpful, the course's faculty reply.
// ===============================

// Faculty / admin (declared before "/course/:courseId")
router.get("/faculty", protect, authorizeRoles("faculty", "admin"), getFacultyFeedback);
router.put("/:id/reply", protect, authorizeRoles("faculty", "admin"), validateObjectId("id"), replyToFeedback);
router.delete("/:id/reply", protect, authorizeRoles("faculty", "admin"), validateObjectId("id"), deleteReply);

// Any signed-in user can read a course's feedback
router.get("/course/:courseId", protect, validateObjectId("courseId"), getCourseFeedback);

// Students
router.put("/course/:courseId", protect, authorizeRoles("student"), validateObjectId("courseId"), saveMyFeedback);
router.delete("/course/:courseId", protect, authorizeRoles("student"), validateObjectId("courseId"), deleteMyFeedback);
router.post("/:id/helpful", protect, authorizeRoles("student"), validateObjectId("id"), toggleHelpful);

module.exports = router;
