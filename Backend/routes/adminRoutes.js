const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createFaculty,
  getAdminOverview,
  getFacultyList,
  getStudentProgressList,
  getCourseRatings,
} = require("../controllers/adminController");

// All admin routes require authenticated user with role "admin"
router.use(protect);
router.use(authorizeRoles("admin"));

router.post("/faculty", createFaculty);
router.get("/faculty", getFacultyList);
router.get("/overview", getAdminOverview);
router.get("/students", getStudentProgressList);
router.get("/course-ratings", getCourseRatings);

module.exports = router;
