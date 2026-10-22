const express = require("express");
const router = express.Router();

const { getStudents, getStudentDetail } = require("../controllers/facultyStudentsController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");

// ===============================
// Faculty / admin: registered students, their details and login status.
// Students cannot reach these routes (authorizeRoles).
// ===============================
router.use(protect, authorizeRoles("faculty", "admin"));

router.get("/", getStudents);
router.get("/:studentId", validateObjectId("studentId"), getStudentDetail);

module.exports = router;
