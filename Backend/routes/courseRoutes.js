const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getMyFacultyCourses,
  getCourseById,
  updateCourse,
} = require("../controllers/courseController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// Public Routes
// ===============================

// Get all courses
router.get("/", getAllCourses);

// Get faculty's own courses (Faculty / Admin)
router.get(
  "/faculty/my-courses",
  protect,
  authorizeRoles("faculty", "admin"),
  getMyFacultyCourses
);

// Get course by ID
router.get("/:id", validateObjectId("id"), getCourseById);

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

// Faculty (own course) / Admin can update course details and lessons
router.put(
  "/:id",
  protect,
  authorizeRoles("faculty", "admin"),
  validateObjectId("id"),
  updateCourse
);

module.exports = router;