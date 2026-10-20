const fs = require("fs");
const path = require("path");
const { pipeline } = require("stream/promises");
const { TEMP_DIR, getBucket, removeFile } = require("./submissionFiles");

// ==============================
// Private storage for faculty lecture materials (PDF / PPT / PPTX).
//
// Always stored in MongoDB GridFS (bucket "lectureMaterials") so files
// survive restarts/redeploys on hosts with an ephemeral disk (Render).
// Files are only streamed by the authenticated materials file route.
// ==============================

const GRIDFS_BUCKET = "lectureMaterials";
const INCOMING_DIR = path.join(TEMP_DIR, "materials");

const MAX_MATERIAL_MB = Number(process.env.LECTURE_MATERIAL_MAX_MB) || 25;
const MAX_MATERIAL_BYTES = MAX_MATERIAL_MB * 1024 * 1024;

// Random UUID v4 — the only shape accepted for a stored file id.
const FILE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

// Allowed types by extension. Browsers often report Office files as
// octet-stream/zip, so those are accepted too; the file's actual bytes are
// always checked (see hasValidSignature).
const MATERIAL_TYPES = {
  ".pdf": {
    kind: "pdf",
    mimeType: "application/pdf",
    accept: ["application/pdf", "application/x-pdf", "application/octet-stream"],
  },
  ".pptx": {
    kind: "pptx",
    mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    accept: [
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "application/zip",
      "application/x-zip-compressed",
      "application/octet-stream",
    ],
  },
  ".ppt": {
    kind: "ppt",
    mimeType: "application/vnd.ms-powerpoint",
    accept: ["application/vnd.ms-powerpoint", "application/mspowerpoint", "application/octet-stream"],
  },
};

const typeForName = (name) => MATERIAL_TYPES[path.extname(String(name || "")).toLowerCase()] || null;

const OLE2_SIGNATURE = Buffer.from([0xd0, 0xcf, 0x11, 0xe0, 0xa1, 0xb1, 0x1a, 0xe1]);

const readRange = (filePath, start, length) => {
  const fd = fs.openSync(filePath, "r");
  try {
    const buffer = Buffer.alloc(length);
    const read = fs.readSync(fd, buffer, 0, length, start);
    return buffer.subarray(0, read);
  } finally {
    fs.closeSync(fd);
  }
};

// Check the file content matches its extension:
//   pdf  — "%PDF-" near the start
//   pptx — a ZIP whose central directory (at the end) lists ppt/presentation.xml
//   ppt  — an OLE2 compound document
const hasValidSignature = (filePath, kind, size) => {
  if (kind === "pdf") return readRange(filePath, 0, 1024).includes("%PDF-");
  if (kind === "ppt") return readRange(filePath, 0, 8).equals(OLE2_SIGNATURE);
  if (kind === "pptx") {
    if (!readRange(filePath, 0, 4).equals(Buffer.from("PK\x03\x04", "latin1"))) return false;
    const tailLength = Math.min(size, 2 * 1024 * 1024);
    return readRange(filePath, size - tailLength, tailLength).includes("ppt/presentation.xml");
  }
  return false;
};

const ensureIncomingDir = () => fs.mkdirSync(INCOMING_DIR, { recursive: true });

// Move a validated upload into GridFS, then delete the temp file.
const persistMaterialFile = async (file, metadata = {}) => {
  const upload = getBucket(GRIDFS_BUCKET).openUploadStreamWithId(file.fileId, file.fileId, {
    metadata: { ...metadata, contentType: file.materialType.mimeType },
  });
  await pipeline(fs.createReadStream(file.path), upload);
  removeFile(file.path);
};

// Resolves to { size, stream } or null when the file no longer exists.
const openMaterialFile = async (fileId) => {
  if (!FILE_ID_PATTERN.test(String(fileId))) return null;
  const bucket = getBucket(GRIDFS_BUCKET);
  const doc = await bucket.find({ _id: fileId }).limit(1).next();
  if (!doc) return null;
  return { size: doc.length, stream: bucket.openDownloadStream(fileId) };
};

const removeMaterialFile = (fileId) => {
  if (!FILE_ID_PATTERN.test(String(fileId))) return;
  try {
    getBucket(GRIDFS_BUCKET)
      .delete(fileId)
      .catch((error) => {
        if (!/not found/i.test(error.message)) console.error("Could not delete lecture material file:", error.message);
      });
  } catch (error) {
    console.error("Could not delete lecture material file:", error.message);
  }
};

// Display/download name with the validated extension; strips anything that
// could break a header or a path.
const cleanMaterialName = (name, extension) => {
  const base =
    path
      .basename(String(name || ""))
      .replace(/\.[^.]*$/, "")
      .replace(/[\u0000-\u001f\u007f"\\/<>:|?*]+/g, "_")
      .trim() || "material";
  return `${base.slice(0, 140)}${extension}`;
};

module.exports = {
  INCOMING_DIR,
  MAX_MATERIAL_MB,
  MAX_MATERIAL_BYTES,
  FILE_ID_PATTERN,
  MATERIAL_TYPES,
  typeForName,
  hasValidSignature,
  ensureIncomingDir,
  persistMaterialFile,
  openMaterialFile,
  removeMaterialFile,
  cleanMaterialName,
};
