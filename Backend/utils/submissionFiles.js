const fs = require("fs");
const os = require("os");
const path = require("path");
const { pipeline } = require("stream/promises");
const mongoose = require("mongoose");

// ==============================
// Private storage for assignment PDFs.
//
// Files are saved under a random id (never the student's filename) and are
// only streamed by the authenticated submission file route after an
// ownership check. Two backends:
//
//   gridfs (default) — stored in MongoDB (GridFS bucket "submissionFiles"),
//                      so PDFs survive restarts/redeploys on hosts with an
//                      ephemeral disk (Render, Railway, ...). No extra
//                      service or credentials: it uses MONGODB_URI.
//   local            — stored on the server's disk (SUBMISSION_UPLOAD_DIR).
//                      Only persistent where the disk is.
//
// Each stored file records which backend holds it (`file.storage`), so files
// saved before a switch stay readable. Records without `storage` are local.
// ==============================

const STORAGE_DRIVER =
  String(process.env.SUBMISSION_STORAGE || "gridfs").toLowerCase() === "local" ? "local" : "gridfs";

const UPLOAD_DIR = path.resolve(
  process.env.SUBMISSION_UPLOAD_DIR || path.join(__dirname, "..", "uploads", "submissions")
);

// With GridFS, multer writes to a temp dir first (so the PDF signature can be
// checked) and the file is moved into MongoDB once the submission is valid.
const TEMP_DIR = path.join(os.tmpdir(), "study-buddy-uploads");
const INCOMING_DIR = STORAGE_DRIVER === "local" ? UPLOAD_DIR : TEMP_DIR;

const GRIDFS_BUCKET = "submissionFiles";

const MAX_PDF_MB = Number(process.env.ASSIGNMENT_PDF_MAX_MB) || 10;
const MAX_PDF_BYTES = MAX_PDF_MB * 1024 * 1024;

// Random UUID v4 — the only shape accepted for a stored file id.
const FILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

const ensureUploadDir = () => fs.mkdirSync(INCOMING_DIR, { recursive: true });

const filePathFor = (fileId) => {
  if (!FILE_ID_PATTERN.test(String(fileId))) throw new Error("Invalid file id.");
  return path.join(UPLOAD_DIR, `${fileId}.pdf`);
};

const fileUrlFor = (fileId) => `/api/submissions/files/${fileId}`;

// GridFS bucket handle; other private file stores (e.g. lecture materials)
// reuse this with their own bucket name.
const getBucket = (bucketName = GRIDFS_BUCKET) => {
  if (!mongoose.connection.db) throw new Error("Database is not connected.");
  return new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName });
};

// Every real PDF starts with "%PDF-" (allowing a little leading junk, as
// readers do); the browser-reported type alone is not trusted.
const hasPdfSignature = (filePath) => {
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(1024);
    const read = fs.readSync(fd, buffer, 0, buffer.length, 0);
    return buffer.subarray(0, read).includes("%PDF-");
  } finally {
    fs.closeSync(fd);
  }
};

const removeFile = (filePath) => {
  if (!filePath) return;
  fs.promises.unlink(filePath).catch((error) => {
    if (error.code !== "ENOENT") console.error("Could not delete submission file:", error.message);
  });
};

// Move a validated upload (multer's req.file) into permanent storage.
// Returns the storage name to record on the submission.
const persistUpload = async (file, metadata = {}) => {
  if (STORAGE_DRIVER === "local") return "local";

  const upload = getBucket().openUploadStreamWithId(file.fileId, `${file.fileId}.pdf`, {
    metadata: { ...metadata, contentType: "application/pdf" },
  });
  await pipeline(fs.createReadStream(file.path), upload);
  removeFile(file.path);
  return "gridfs";
};

// Open a stored submission file for streaming. Resolves to
// { size, stream } or null when the file no longer exists.
const openStoredFile = async (fileRecord) => {
  const { fileId } = fileRecord || {};
  if (!FILE_ID_PATTERN.test(String(fileId))) return null;

  if (fileRecord.storage === "gridfs") {
    const bucket = getBucket();
    const doc = await bucket.find({ _id: fileId }).limit(1).next();
    if (!doc) return null;
    return { size: doc.length, stream: bucket.openDownloadStream(fileId) };
  }

  const filePath = filePathFor(fileId);
  try {
    const stat = await fs.promises.stat(filePath);
    return { size: stat.size, stream: fs.createReadStream(filePath) };
  } catch {
    return null;
  }
};

// Delete a stored file; accepts the submission's file record.
const removeStoredFile = (fileRecord) => {
  const { fileId, storage } = fileRecord || {};
  if (!FILE_ID_PATTERN.test(String(fileId))) return;

  if (storage === "gridfs") {
    try {
      getBucket()
        .delete(fileId)
        .catch((error) => {
          if (!/not found/i.test(error.message)) console.error("Could not delete submission file:", error.message);
        });
    } catch (error) {
      console.error("Could not delete submission file:", error.message);
    }
    return;
  }

  removeFile(filePathFor(fileId));
};

// Keep the original name for display/download only; strip anything that
// could break a header or a path.
const cleanOriginalName = (name) => {
  const base = path.basename(String(name || "submission.pdf")).replace(/[\u0000-\u001f\u007f"\\/<>:|?*]+/g, "_").trim();
  const withExt = /\.pdf$/i.test(base) ? base : `${base || "submission"}.pdf`;
  return withExt.slice(-150);
};

module.exports = {
  STORAGE_DRIVER,
  UPLOAD_DIR,
  INCOMING_DIR,
  MAX_PDF_MB,
  MAX_PDF_BYTES,
  FILE_ID_PATTERN,
  TEMP_DIR,
  ensureUploadDir,
  getBucket,
  filePathFor,
  fileUrlFor,
  hasPdfSignature,
  removeFile,
  persistUpload,
  openStoredFile,
  removeStoredFile,
  cleanOriginalName,
};
