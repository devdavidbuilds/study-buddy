const crypto = require("crypto");
const path = require("path");
const multer = require("multer");
const {
  INCOMING_DIR,
  MAX_PDF_MB,
  MAX_PDF_BYTES,
  ensureUploadDir,
  hasPdfSignature,
  removeFile,
} = require("../utils/submissionFiles");

// ==============================
// Optional single-PDF upload for assignment submissions.
//
// Runs only for multipart requests (JSON submissions pass straight
// through). On success req.file = { fileId, path, originalname, size, ... }.
// Any rejected file is deleted before responding. The controller moves an
// accepted file into permanent storage (utils/submissionFiles#persistUpload).
// ==============================

// Some systems label PDFs as octet-stream; the ".pdf" extension and the
// %PDF- signature check below still apply.
const PDF_TYPES = new Set(["application/pdf", "application/x-pdf", "application/octet-stream"]);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        ensureUploadDir();
        cb(null, INCOMING_DIR);
      } catch (error) {
        cb(error);
      }
    },
    filename: (req, file, cb) => {
      const fileId = crypto.randomUUID();
      file.fileId = fileId;
      cb(null, `${fileId}.pdf`);
    },
  }),
  limits: {
    fileSize: MAX_PDF_BYTES,
    files: 1,
    fields: 20,
    fieldSize: 256 * 1024, // same ceiling as the JSON body parser
  },
  fileFilter: (req, file, cb) => {
    const isPdf = PDF_TYPES.has(file.mimetype) && path.extname(file.originalname || "").toLowerCase() === ".pdf";
    if (!isPdf) {
      return cb(Object.assign(new Error("Only PDF files can be uploaded."), { status: 400 }));
    }
    cb(null, true);
  },
}).single("file");

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: `The PDF is too large. The maximum size is ${MAX_PDF_MB} MB.`,
  LIMIT_FILE_COUNT: "Upload one PDF per submission.",
  LIMIT_UNEXPECTED_FILE: 'Upload the PDF in a field named "file".',
  LIMIT_FIELD_VALUE: "Your answers are too long.",
  LIMIT_FIELD_COUNT: "Too many form fields.",
};

const uploadSubmissionPdf = (req, res, next) => {
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
      let valid = false;
      try {
        valid = req.file.size > 0 && hasPdfSignature(req.file.path);
      } catch {
        valid = false;
      }
      if (!valid) {
        removeFile(req.file.path);
        req.file = undefined;
        return res.status(400).json({
          success: false,
          message: "This file is not a valid PDF.",
        });
      }
      req.file.fileId = req.file.fileId || path.basename(req.file.filename, ".pdf");
    }

    next();
  });
};

module.exports = uploadSubmissionPdf;
