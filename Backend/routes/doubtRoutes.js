const express = require("express");
const {
  createDoubt,
  getCourseDoubts,
  getMyDoubts,
  getFacultyDoubts,
  replyToDoubt,
} = require("../controllers/doubtController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

const router = express.Router();

// Student creates a doubt
router.post("/", protect, createDoubt);

// Student gets their own doubts
router.get("/my", protect, getMyDoubts);

// Get doubts for a specific course
router.get("/course/:courseId", protect, validateObjectId("courseId"), getCourseDoubts);

// Faculty / Admin gets doubts for their courses
router.get("/faculty", protect, authorizeRoles("faculty", "admin"), getFacultyDoubts);

// Faculty / Admin replies to a doubt
router.put("/:id/reply", protect, authorizeRoles("faculty", "admin"), validateObjectId("id"), replyToDoubt);

module.exports = router;
