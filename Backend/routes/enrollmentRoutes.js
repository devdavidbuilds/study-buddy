const express = require("express");
const router = express.Router();

const {
  getMyEnrollments,
  getMyEnrollmentForCourse,
  requestEnrollment,
  cancelEnrollmentRequest,
  getEnrollmentRequests,
  decideEnrollment,
} = require("../controllers/enrollmentController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// Course enrollment: students request, faculty of the course approve.
// ===============================

// Student
router.get("/mine", protect, authorizeRoles("student"), getMyEnrollments);
router.get("/course/:courseId", protect, authorizeRoles("student"), validateObjectId("courseId"), getMyEnrollmentForCourse);
router.post("/course/:courseId", protect, authorizeRoles("student"), validateObjectId("courseId"), requestEnrollment);
router.delete("/course/:courseId", protect, authorizeRoles("student"), validateObjectId("courseId"), cancelEnrollmentRequest);

// Faculty / admin
router.get("/requests", protect, authorizeRoles("faculty", "admin"), getEnrollmentRequests);
router.put("/:id/decision", protect, authorizeRoles("faculty", "admin"), validateObjectId("id"), decideEnrollment);

module.exports = router;
