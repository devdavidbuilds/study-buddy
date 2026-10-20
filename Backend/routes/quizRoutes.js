const express = require("express");
const router = express.Router();

const {
  createQuiz,
  getQuizzesByCourse,
  getQuizzesForLesson,
  getMyQuizzes,
  submitQuiz,
} = require("../controllers/quizController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// Protected routes. Student lesson reads are sanitized by the controller.
// ===============================

// Faculty: get all quizzes created by the logged-in faculty
router.get("/my", protect, authorizeRoles("faculty", "admin"), getMyQuizzes);

// Faculty: get quizzes for a course they own
router.get(
  "/course/:courseId",
  protect,
  authorizeRoles("faculty", "admin"),
  validateObjectId("courseId"),
  getQuizzesByCourse
);

// Faculty: get quizzes for a specific module/lesson within a course they own
router.get(
  "/course/:courseId/module/:moduleId/lesson/:lessonId",
  protect,
  authorizeRoles("student", "faculty", "admin"),
  validateObjectId("courseId"),
  getQuizzesForLesson
);

router.post(
  "/course/:courseId/:quizId/submit",
  protect,
  authorizeRoles("student"),
  validateObjectId("courseId"),
  validateObjectId("quizId"),
  submitQuiz
);

// Faculty: create a quiz
router.post(
  "/create",
  protect,
  authorizeRoles("faculty", "admin"),
  createQuiz
);

module.exports = router;
