const express = require("express");
const router = express.Router();

const {
  createAssignment,
  getAssignmentsByCourse,
  getMyAssignments,
  getAssignmentsForLesson,
  getSubmissionsForAssignment,
  evaluateSubmission,
} = require("../controllers/assignmentController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// Protected Routes
// ===============================

// Faculty: get all their assignments
router.get(
  "/my",
  protect,
  authorizeRoles("faculty", "admin"),
  getMyAssignments
);

// Get assignments for a specific course (any authenticated user)
router.get(
  "/course/:courseId",
  protect,
  validateObjectId("courseId"),
  getAssignmentsByCourse
);

// Get assignments for a specific module/lesson within a course
// (any authenticated user — used by the student assignment flow)
router.get(
  "/course/:courseId/module/:moduleId/lesson/:lessonId",
  protect,
  validateObjectId("courseId"),
  getAssignmentsForLesson
);

// Faculty/Admin: create an assignment
router.post(
  "/create",
  protect,
  authorizeRoles("faculty", "admin"),
  createAssignment
);

// Faculty/Admin: get all student submissions for an assignment
// (only for assignments belonging to a course they own — enforced in controller)
router.get(
  "/:assignmentId/submissions",
  protect,
  authorizeRoles("faculty", "admin"),
  validateObjectId("assignmentId"),
  getSubmissionsForAssignment
);

// Faculty/Admin: save marks + feedback for a student's submission
router.put(
  "/:assignmentId/submissions/:studentId/evaluate",
  protect,
  authorizeRoles("faculty", "admin"),
  validateObjectId("assignmentId"),
  validateObjectId("studentId"),
  evaluateSubmission
);

module.exports = router;
