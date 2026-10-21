const Certificate = require("../models/Certificate");
const { writeCertificatePdf } = require("../utils/certificates");

const CERTIFICATE_ID_PATTERN = /^SB-\d{4}-[0-9A-F]{10}$/;

// ==============================
// GET /api/certificates/mine
// ==============================
const getMyCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find({ student: req.user._id })
      .sort({ issuedAt: -1 })
      .lean();

    return res.status(200).json({ success: true, data: certificates });
  } catch (error) {
    console.error("Get Certificates Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load your certificates.",
    });
  }
};

// ==============================
// GET /api/certificates/:certificateId/download
// Owner student only; streams the PDF as an attachment.
// ==============================
const downloadCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    if (!CERTIFICATE_ID_PATTERN.test(certificateId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid certificate id.",
      });
    }

    const certificate = await Certificate.findOne({
      certificateId,
      student: req.user._id,
    }).lean();

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "Certificate not found.",
      });
    }

    const safeCourse = certificate.courseName
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="StudyBuddy-Certificate-${safeCourse || "Course"}.pdf"`
    );

    writeCertificatePdf(certificate, res);
  } catch (error) {
    console.error("Download Certificate Error:", error.message);
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Unable to generate the certificate.",
      });
    }
    res.end();
  }
};

// ==============================
// GET /api/certificates/verify/:certificateId  (public)
// Confirms a certificate is genuine without exposing anything beyond
// what is printed on it.
// ==============================
const verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;

    const certificate = CERTIFICATE_ID_PATTERN.test(certificateId)
      ? await Certificate.findOne({ certificateId })
          .select("certificateId studentName courseName courseCode issuedAt -_id")
          .lean()
      : null;

    if (!certificate) {
      return res.status(404).json({
        success: false,
        message: "No certificate matches this id.",
      });
    }

    return res.status(200).json({ success: true, data: certificate });
  } catch (error) {
    console.error("Verify Certificate Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to verify the certificate.",
    });
  }
};

module.exports = {
  getMyCertificates,
  downloadCertificate,
  verifyCertificate,
};
