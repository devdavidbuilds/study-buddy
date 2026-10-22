const mongoose = require("mongoose");
const { isApprovedStudent, ENROLLMENT_REQUIRED_MESSAGE } = require("../utils/enrollment");
const Course = require("../models/Course");
const LectureMaterial = require("../models/LectureMaterial");
const { removeFile } = require("../utils/submissionFiles");
const {
  persistMaterialFile,
  openMaterialFile,
  removeMaterialFile,
  cleanMaterialName,
} = require("../utils/lectureMaterialFiles");

// ==============================
// Access rules (enforced here, not just in the UI):
//   - students: list and open materials of any course (courses are an open
//     catalog for logged-in students)
//   - faculty: list/upload/edit/delete materials of courses they own
//   - admin: everything
// ==============================

const canManageCourse = (course, user) =>
  user.role === "admin" || String(course.faculty) === String(user._id);

const canViewCourseMaterials = (course, user) => user.role === "student" || canManageCourse(course, user);

const COURSE_FIELDS = "faculty courseName courseCode modules.id modules.title";

const validateText = ({ title, description }, { requireTitle }) => {
  if (title !== undefined || requireTitle) {
    if (typeof title !== "string" || title.trim().length < 3 || title.trim().length > 200) {
      return "Title must be 3-200 characters.";
    }
  }
  if (description !== undefined && description !== null) {
    if (typeof description !== "string" || description.trim().length > 2000) {
      return "Description must be text of at most 2000 characters.";
    }
  }
  return null;
};

const moduleExists = (course, moduleId) =>
  !moduleId || (course.modules || []).some((m) => m.id === moduleId);

// Public shape of a material (the storage id is never sent to clients).
const serialize = (material, course, user) => {
  const moduleTitle = material.moduleId
    ? (course?.modules || []).find((m) => m.id === material.moduleId)?.title || ""
    : "";
  return {
    _id: material._id,
    title: material.title,
    description: material.description,
    courseId: course?._id || material.course,
    courseName: course?.courseName || "",
    courseCode: course?.courseCode || "",
    moduleId: material.moduleId || "",
    moduleTitle,
    uploadedBy: material.uploadedBy?._id
      ? { _id: material.uploadedBy._id, fullName: material.uploadedBy.fullName || "" }
      : { _id: material.uploadedBy, fullName: "" },
    file: {
      originalName: material.file.originalName,
      size: material.file.size,
      kind: material.file.kind,
      mimeType: material.file.mimeType,
    },
    fileUrl: `/api/materials/${material._id}/file`,
    canManage: course ? canManageCourse(course, user) : false,
    createdAt: material.createdAt,
    updatedAt: material.updatedAt,
  };
};

const fileRecordFor = (file) => ({
  fileId: file.fileId,
  originalName: cleanMaterialName(file.originalname, `.${file.materialType.kind}`),
  size: file.size,
  mimeType: file.materialType.mimeType,
  kind: file.materialType.kind,
});

// Loads a material + its course and checks the user may manage it.
const loadManageable = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(404).json({ success: false, message: "Material not found." });
    return null;
  }
  const material = await LectureMaterial.findById(req.params.id);
  const course = material ? await Course.findById(material.course).select(COURSE_FIELDS).lean() : null;
  if (!material || !course) {
    res.status(404).json({ success: false, message: "Material not found." });
    return null;
  }
  if (!canManageCourse(course, req.user)) {
    res.status(403).json({ success: false, message: "You can only manage materials for your own courses." });
    return null;
  }
  return { material, course };
};

// ==============================
// GET /api/materials/course/:courseId[?moduleId=]
// ==============================
const getCourseMaterials = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select(COURSE_FIELDS).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    if (!canViewCourseMaterials(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "Lecture materials are available to students and this course's faculty.",
      });
    }

    const query = { course: course._id };
    if (req.query.moduleId) query.moduleId = String(req.query.moduleId);

    const materials = await LectureMaterial.find(query)
      .populate("uploadedBy", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: materials.length,
      data: materials.map((m) => serialize(m, course, req.user)),
    });
  } catch (error) {
    console.error("Get Course Materials Error:", error);
    res.status(500).json({ success: false, message: "Could not load lecture materials." });
  }
};

// ==============================
// GET /api/materials/mine[?courseId=]
// Faculty: materials in courses they own. Admin: all.
// ==============================
const getMyMaterials = async (req, res) => {
  try {
    const query = {};
    if (req.query.courseId) {
      if (!mongoose.isValidObjectId(req.query.courseId)) {
        return res.status(400).json({ success: false, message: "Invalid courseId." });
      }
      query.course = req.query.courseId;
    }

    const materials = await LectureMaterial.find(query)
      .populate("uploadedBy", "fullName")
      .sort({ createdAt: -1 })
      .lean();

    const courseIds = [...new Set(materials.map((m) => String(m.course)))];
    const courses = courseIds.length
      ? await Course.find({ _id: { $in: courseIds } }).select(COURSE_FIELDS).lean()
      : [];
    const courseById = new Map(courses.map((c) => [String(c._id), c]));

    const data = materials
      .filter((m) => {
        const course = courseById.get(String(m.course));
        return course && canManageCourse(course, req.user);
      })
      .map((m) => serialize(m, courseById.get(String(m.course)), req.user));

    res.status(200).json({ success: true, count: data.length, data });
  } catch (error) {
    console.error("Get My Materials Error:", error);
    res.status(500).json({ success: false, message: "Could not load lecture materials." });
  }
};

// ==============================
// POST /api/materials  (multipart: file, title, description, courseId, moduleId)
// ==============================
const createMaterial = async (req, res) => {
  let persisted = false;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Choose a PDF, PPT or PPTX file to upload." });
    }

    const { title, description, courseId } = req.body || {};
    const moduleId = req.body?.moduleId ? String(req.body.moduleId) : "";

    const textError = validateText({ title, description }, { requireTitle: true });
    if (textError) return res.status(400).json({ success: false, message: textError });

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({ success: false, message: "Select a valid course." });
    }
    const course = await Course.findById(courseId).select(COURSE_FIELDS).lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }
    if (!canManageCourse(course, req.user)) {
      return res.status(403).json({ success: false, message: "You can only upload materials to your own courses." });
    }
    if (!moduleExists(course, moduleId)) {
      return res.status(400).json({ success: false, message: "The selected module does not belong to this course." });
    }

    await persistMaterialFile(req.file, { courseId: String(course._id), uploadedBy: String(req.user._id) });
    persisted = true;

    const material = await LectureMaterial.create({
      title: title.trim(),
      description: (description || "").trim(),
      course: course._id,
      moduleId,
      uploadedBy: req.user._id,
      file: fileRecordFor(req.file),
    });

    res.status(201).json({
      success: true,
      message: "Lecture material uploaded.",
      data: serialize({ ...material.toObject(), uploadedBy: { _id: req.user._id, fullName: req.user.fullName } }, course, req.user),
    });
  } catch (error) {
    console.error("Create Material Error:", error);
    if (persisted) removeMaterialFile(req.file.fileId);
    const status = error.name === "ValidationError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? error.message : "Could not upload the lecture material.",
    });
  } finally {
    if (req.file && !persisted) removeFile(req.file.path);
  }
};

// ==============================
// PUT /api/materials/:id  (JSON metadata, or multipart to also replace the file)
// Editable: title, description, moduleId. The course stays fixed.
// ==============================
const updateMaterial = async (req, res) => {
  let persisted = false;
  try {
    const loaded = await loadManageable(req, res);
    if (!loaded) return;
    const { material, course } = loaded;

    const { title, description } = req.body || {};
    const textError = validateText({ title, description }, { requireTitle: false });
    if (textError) return res.status(400).json({ success: false, message: textError });

    if (req.body?.moduleId !== undefined) {
      const moduleId = req.body.moduleId ? String(req.body.moduleId) : "";
      if (!moduleExists(course, moduleId)) {
        return res.status(400).json({ success: false, message: "The selected module does not belong to this course." });
      }
      material.moduleId = moduleId;
    }
    if (title !== undefined) material.title = title.trim();
    if (description !== undefined && description !== null) material.description = description.trim();

    let replacedFileId = null;
    if (req.file) {
      await persistMaterialFile(req.file, { courseId: String(course._id), uploadedBy: String(req.user._id) });
      persisted = true;
      replacedFileId = material.file.fileId;
      material.file = fileRecordFor(req.file);
    }

    await material.save();
    if (replacedFileId) removeMaterialFile(replacedFileId);

    await material.populate("uploadedBy", "fullName");
    res.status(200).json({
      success: true,
      message: "Lecture material updated.",
      data: serialize(material.toObject(), course, req.user),
    });
  } catch (error) {
    console.error("Update Material Error:", error);
    if (persisted) removeMaterialFile(req.file.fileId);
    const status = error.name === "ValidationError" ? 400 : 500;
    res.status(status).json({
      success: false,
      message: status === 400 ? error.message : "Could not update the lecture material.",
    });
  } finally {
    if (req.file && !persisted) removeFile(req.file.path);
  }
};

// ==============================
// DELETE /api/materials/:id
// ==============================
const deleteMaterial = async (req, res) => {
  try {
    const loaded = await loadManageable(req, res);
    if (!loaded) return;
    const { material } = loaded;

    await material.deleteOne();
    removeMaterialFile(material.file.fileId);

    res.status(200).json({ success: true, message: "Lecture material deleted." });
  } catch (error) {
    console.error("Delete Material Error:", error);
    res.status(500).json({ success: false, message: "Could not delete the lecture material." });
  }
};

// ==============================
// GET /api/materials/:id/file[?download=1]
// PDFs open inline (in-browser preview); PowerPoint files always download.
// ==============================
const getMaterialFile = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(404).json({ success: false, message: "File not found." });
    }
    const material = await LectureMaterial.findById(req.params.id).lean();
    const course = material ? await Course.findById(material.course).select("faculty").lean() : null;
    // Unauthorized users get the same 404 as missing files.
    if (!material || !course || !canViewCourseMaterials(course, req.user)) {
      return res.status(404).json({ success: false, message: "File not found." });
    }
    // Students can see the list of materials in the course preview, but
    // opening a file needs an approved enrollment.
    if (req.user.role === "student" && !(await isApprovedStudent(req.user._id, course._id))) {
      return res.status(403).json({ success: false, code: "ENROLLMENT_REQUIRED", message: ENROLLMENT_REQUIRED_MESSAGE });
    }

    const stored = await openMaterialFile(material.file.fileId);
    if (!stored) {
      return res.status(404).json({ success: false, message: "This file is no longer available on the server." });
    }

    const name = material.file.originalName || `material.${material.file.kind}`;
    const asciiName = name.replace(/[^\x20-\x7e]/g, "_");
    const inline = material.file.kind === "pdf" && req.query.download !== "1";

    res.set({
      "Content-Type": material.file.mimeType,
      "Content-Length": stored.size,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });

    stored.stream
      .on("error", (error) => {
        console.error("Material file stream error:", error.message);
        if (!res.headersSent) res.status(500).end();
        else res.destroy(error);
      })
      .pipe(res);
  } catch (error) {
    console.error("Get Material File Error:", error);
    res.status(500).json({ success: false, message: "Could not load the file." });
  }
};

module.exports = {
  getCourseMaterials,
  getMyMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
  getMaterialFile,
};
