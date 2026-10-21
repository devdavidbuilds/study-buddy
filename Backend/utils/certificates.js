const crypto = require("crypto");
const PDFDocument = require("pdfkit");
const Certificate = require("../models/Certificate");
const User = require("../models/User");

const SITE_NAME = "studybuddy.com";
const BRAND = "#E75480";
const INK = "#2E2E2E";
const MUTED = "#7A7068";

const newCertificateId = () =>
  `SB-${new Date().getFullYear()}-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;

// ==============================
// Issue the course certificate for a student whose completion just hit
// (or already is) 100%. Idempotent: returns the existing certificate if
// one was issued before, so it is safe to call on every progress read.
// `course` must include courseName/courseCode and, ideally, a populated
// or raw `faculty` field.
// ==============================
const issueCertificate = async ({ studentId, course, totalLessons }) => {
  const existing = await Certificate.findOne({
    student: studentId,
    course: course._id,
  }).lean();
  if (existing) return existing;

  const student = await User.findById(studentId).select("fullName").lean();
  if (!student) return null;

  let instructorName = "";
  if (course.faculty) {
    instructorName =
      course.faculty.fullName ||
      (await User.findById(course.faculty).select("fullName").lean())?.fullName ||
      "";
  }

  try {
    const certificate = await Certificate.create({
      certificateId: newCertificateId(),
      student: studentId,
      course: course._id,
      studentName: student.fullName,
      courseName: course.courseName || "Study Buddy Course",
      courseCode: course.courseCode || "",
      instructorName,
      totalLessons,
    });
    return certificate.toObject();
  } catch (error) {
    // Two requests finishing the course at once: the unique index lets
    // only one insert win, so return that one.
    if (error.code === 11000) {
      return Certificate.findOne({ student: studentId, course: course._id }).lean();
    }
    throw error;
  }
};

const formatDate = (date) =>
  new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

// ==============================
// Render a certificate as a landscape A4 PDF and pipe it to `stream`.
// ==============================
const writeCertificatePdf = (certificate, stream) => {
  const doc = new PDFDocument({
    size: "A4",
    layout: "landscape",
    margin: 0,
    info: {
      Title: `Certificate of Completion - ${certificate.courseName}`,
      Author: "Study Buddy",
      Subject: certificate.certificateId,
    },
  });
  doc.pipe(stream);

  const { width, height } = doc.page;
  const center = { width: width - 160, align: "center" };

  // Frame
  doc.rect(0, 0, width, height).fill("#FFFBF8");
  doc.lineWidth(6).strokeColor(BRAND).rect(24, 24, width - 48, height - 48).stroke();
  doc.lineWidth(1).strokeColor(BRAND).rect(36, 36, width - 72, height - 72).stroke();

  // Header
  doc.fillColor(BRAND).font("Helvetica-Bold").fontSize(20)
    .text("STUDY BUDDY", 80, 70, center);
  doc.fillColor(MUTED).font("Helvetica").fontSize(11)
    .text(SITE_NAME, 80, 96, center);

  doc.fillColor(INK).font("Times-Bold").fontSize(40)
    .text("Certificate of Completion", 80, 135, center);

  doc.fillColor(MUTED).font("Helvetica").fontSize(14)
    .text("This is to certify that", 80, 200, center);

  // Student name
  doc.fillColor(BRAND).font("Times-BoldItalic").fontSize(36)
    .text(certificate.studentName, 80, 228, { ...center, height: 50, ellipsis: true });
  const nameLineY = 278;
  doc.lineWidth(1).strokeColor("#D9CFC7")
    .moveTo(width / 2 - 200, nameLineY).lineTo(width / 2 + 200, nameLineY).stroke();

  doc.fillColor(MUTED).font("Helvetica").fontSize(14)
    .text("has successfully completed the course", 80, 295, center);

  // Course name
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(24)
    .text(certificate.courseName, 80, 325, { ...center, height: 64, ellipsis: true });

  const details = [
    certificate.courseCode,
    certificate.totalLessons
      ? `${certificate.totalLessons} lesson${certificate.totalLessons === 1 ? "" : "s"}`
      : "",
    certificate.instructorName ? `Instructor: ${certificate.instructorName}` : "",
  ].filter(Boolean).join("   •   ");
  if (details) {
    doc.fillColor(MUTED).font("Helvetica").fontSize(11)
      .text(details, 80, 395, center);
  }

  // Footer: date (left), signature (right)
  const footerY = height - 140;
  doc.fillColor(INK).font("Helvetica-Bold").fontSize(12)
    .text(formatDate(certificate.issuedAt), 110, footerY, { width: 220, align: "center" });
  doc.lineWidth(1).strokeColor("#D9CFC7")
    .moveTo(110, footerY + 20).lineTo(330, footerY + 20).stroke();
  doc.fillColor(MUTED).font("Helvetica").fontSize(10)
    .text("Date of completion", 110, footerY + 28, { width: 220, align: "center" });

  doc.fillColor(BRAND).font("Times-BoldItalic").fontSize(18)
    .text("Study Buddy", width - 330, footerY - 4, { width: 220, align: "center" });
  doc.lineWidth(1).strokeColor("#D9CFC7")
    .moveTo(width - 330, footerY + 20).lineTo(width - 110, footerY + 20).stroke();
  doc.fillColor(MUTED).font("Helvetica").fontSize(10)
    .text("Study Buddy Learning Team", width - 330, footerY + 28, { width: 220, align: "center" });

  doc.fillColor(MUTED).font("Helvetica").fontSize(9)
    .text(
      `Certificate ID: ${certificate.certificateId}   •   Issued by Study Buddy   •   ${SITE_NAME}`,
      80,
      height - 70,
      center
    );

  doc.end();
};

module.exports = { issueCertificate, writeCertificatePdf };
