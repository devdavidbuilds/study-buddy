const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseDomains,
  getMyFacultyCourses,
  getCourseById,
  updateCourse,
} = require("../controllers/courseController");

const {
  protect,
  authorizeRoles,
  optionalAuth,
} = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// Public Routes
// ===============================

// Get all courses
router.get("/", getAllCourses);

// Get domains and course counts for domain-based filtering
router.get("/domains", getCourseDomains);

// Get faculty's own courses (Faculty / Admin)
router.get(
  "/faculty/my-courses",
  protect,
  authorizeRoles("faculty", "admin"),
  getMyFacultyCourses
);

// Get course by ID — everyone sees the outline; lesson content only for
// enrolled students, the course's faculty and admins (optional login).
router.get("/:id", validateObjectId("id"), optionalAuth, getCourseById);

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
