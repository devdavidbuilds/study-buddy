const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
<<<<<<< HEAD
  getMyFacultyCourses,
  getCourseById,
  updateCourse,
=======
  getCourseById,
>>>>>>> origin/main
} = require("../controllers/courseController");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");
<<<<<<< HEAD
const validateObjectId = require("../middleware/validateObjectId");
=======
>>>>>>> origin/main

// ===============================
// Public Routes
// ===============================

// Get all courses
router.get("/", getAllCourses);

<<<<<<< HEAD
// Get faculty's own courses (Faculty / Admin)
router.get(
  "/faculty/my-courses",
  protect,
  authorizeRoles("faculty", "admin"),
  getMyFacultyCourses
);

// Get course by ID
router.get("/:id", validateObjectId("id"), getCourseById);
=======
// Get course by ID
router.get("/:id", getCourseById);
>>>>>>> origin/main

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

<<<<<<< HEAD
// Faculty (own course) / Admin can update course details and lessons
router.put(
  "/:id",
  protect,
  authorizeRoles("faculty", "admin"),
  validateObjectId("id"),
  updateCourse
);

=======
>>>>>>> origin/main
module.exports = router;