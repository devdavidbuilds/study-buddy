const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const { removeFile } = require("../utils/submissionFiles");
const {
  INCOMING_DIR,
  MAX_MATERIAL_MB,
  MAX_MATERIAL_BYTES,
  typeForName,
  hasValidSignature,
  ensureIncomingDir,
} = require("../utils/lectureMaterialFiles");

// ==============================
// Single lecture material upload (PDF / PPT / PPTX) in the field "file".
//
// Runs only for multipart requests (JSON metadata edits pass straight
// through). On success req.file = { fileId, path, originalname, size,
// materialType, ... }. Rejected files are deleted before responding; the
// controller moves accepted ones into GridFS.
// ==============================

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        ensureIncomingDir();
        cb(null, INCOMING_DIR);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const fileId = crypto.randomUUID();
      file.fileId = fileId;
      cb(null, fileId);
    },
  }),
  limits: {
    fileSize: MAX_MATERIAL_BYTES,
    files: 1,
    fields: 10,
    fieldSize: 16 * 1024,
  },
  fileFilter: (req, file, cb) => {
    const type = typeForName(file.originalname);
    if (!type || !type.accept.includes(file.mimetype)) {
      return cb(Object.assign(new Error("Only PDF, PPT and PPTX files can be uploaded."), { status: 400 }));
    }
    file.materialType = type;
    cb(null, true);
  },
}).single("file");

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: `The file is too large. The maximum size is ${MAX_MATERIAL_MB} MB.`,
  LIMIT_FILE_COUNT: "Upload one file at a time.",
  LIMIT_UNEXPECTED_FILE: 'Upload the file in a field named "file".',
  LIMIT_FIELD_VALUE: "A text field is too long.",
  LIMIT_FIELD_COUNT: "Too many form fields.",
};

const uploadLectureMaterial = (req, res, next) => {
  if (!req.is("multipart/form-data")) return next();

  upload(req, res, (error) => {
    if (error) {
      if (req.file) removeFile(req.file.path);
      const status = error.code === "LIMIT_FILE_SIZE" ? 413 : error.status || 400;
      return res.status(status).json({
        success: false,
        message: MULTER_MESSAGES[error.code] || error.message || "The upload could not be processed.",
      });
    }

    if (req.file) {
      const type = typeForName(req.file.originalname);
      let valid = false;
      try {
        valid = Boolean(type) && req.file.size > 0 && hasValidSignature(req.file.path, type.kind, req.file.size);
      } catch {
        valid = false;
      }
      if (!valid) {
        removeFile(req.file.path);
        req.file = undefined;
        return res.status(400).json({
          success: false,
          message: "This file is not a valid PDF or PowerPoint presentation.",
        });
      }
      req.file.materialType = type;
      req.file.fileId = req.file.fileId || path.basename(req.file.filename);
    }

    next();
  });
};

module.exports = uploadLectureMaterial;
