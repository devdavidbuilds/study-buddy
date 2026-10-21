const mongoose = require("mongoose");

// ==============================
// Certificate Schema
//
// Issued once per student per course, automatically, when the student's
// lesson completion for that course reaches 100% (see utils/certificates).
// studentName / courseName are snapshots taken at issue time so the
// certificate never changes if the profile or course is renamed later.
// certificateId is the public, human-readable id printed on the PDF and
// accepted by the public verify endpoint.
// ==============================

const certificateSchema = new mongoose.Schema(
  {
    certificateId: {
      type: String,
      required: true,
      unique: true,
    },

    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    studentName: { type: String, required: true, trim: true },
    courseName: { type: String, required: true, trim: true },
    courseCode: { type: String, default: "", trim: true },
    instructorName: { type: String, default: "", trim: true },
    totalLessons: { type: Number, default: 0 },

    issuedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

certificateSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("Certificate", certificateSchema);
