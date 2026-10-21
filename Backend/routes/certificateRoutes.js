const express = require("express");
const router = express.Router();

const {
  getMyCertificates,
  downloadCertificate,
  verifyCertificate,
} = require("../controllers/certificateController");

const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// ===============================
// Certificates are issued automatically by the progress controller when
// a course reaches 100% — there is deliberately no "create" route.
// ===============================

// Public: confirm a certificate id is genuine.
router.get("/verify/:certificateId", verifyCertificate);

// Student: own certificates and PDF download.
router.get("/mine", protect, authorizeRoles("student"), getMyCertificates);
router.get(
  "/:certificateId/download",
  protect,
  authorizeRoles("student"),
  downloadCertificate
);

module.exports = router;
