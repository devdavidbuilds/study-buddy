const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById,
} = require("../controllers/courseController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

// ===============================
// Public Routes
// ===============================

// Get all courses
router.get("/", getAllCourses);

// Get course by ID
router.get("/:id", getCourseById);

// ===============================
// Protected Routes
// ===============================

// Faculty/Admin can create courses
router.post(
  "/create",
  protect,
  authorizeRoles("faculty", "admin"),
  createCourse
);

module.exports = router;