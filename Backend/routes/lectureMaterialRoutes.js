const express = require("express");
const router = express.Router();

const {
  getCourseMaterials,
  getMyMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialFile,
} = require("../controllers/lectureMaterialController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const validateObjectId = require("../middleware/validateObjectId");
const uploadLectureMaterial = require("../middleware/uploadLectureMaterial");

// ===============================
// Protected Routes (course ownership is enforced in the controller)
// ===============================

// Faculty/Admin: materials in their own courses (optional ?courseId=)
router.get("/mine", protect, authorizeRoles("faculty", "admin"), getMyMaterials);

// Students + course faculty/admin: materials for a course (optional ?moduleId=)
router.get("/course/:courseId", protect, validateObjectId("courseId"), getCourseMaterials);

// Faculty/Admin: upload a PDF/PPT/PPTX (multipart, file in "file")
router.post("/", protect, authorizeRoles("faculty", "admin"), uploadLectureMaterial, createMaterial);

// Faculty/Admin: edit metadata (JSON) or also replace the file (multipart)
router.put("/:id", protect, authorizeRoles("faculty", "admin"), uploadLectureMaterial, updateMaterial);

// Faculty/Admin: delete
router.delete("/:id", protect, authorizeRoles("faculty", "admin"), deleteMaterial);

// Stream the file (students + course faculty/admin)
router.get("/:id/file", protect, getMaterialFile);

module.exports = router;
