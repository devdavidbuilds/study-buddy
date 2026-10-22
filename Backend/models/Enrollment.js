const mongoose = require("mongoose");

// ==============================
// A student's enrollment in a course.
//
// Students preview a course, then request enrollment (pending). The
// course's faculty (or an admin) approves or rejects the request; only
// approved students can open lessons, take checks/quizzes, submit
// assignments and download lecture materials (see utils/enrollment).
// ==============================
const enrollmentSchema = new mongoose.Schema(
  {
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
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Optional note from the student with the request.
    message: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Message cannot exceed 300 characters"],
    },
    // Optional reason from faculty, shown to the student (e.g. on rejection).
    decisionNote: {
      type: String,
      trim: true,
      default: "",
      maxlength: [300, "Note cannot exceed 300 characters"],
    },
    requestedAt: { type: Date, default: Date.now },
    decidedAt: { type: Date, default: null },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    // "request" = asked by the student; "existing" = approved automatically
    // because the student was already learning in the course before
    // approvals were introduced.
    source: { type: String, enum: ["request", "existing"], default: "request" },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

enrollmentSchema.index({ student: 1, course: 1 }, { unique: true });
enrollmentSchema.index({ course: 1, status: 1, requestedAt: -1 });

module.exports = mongoose.model("Enrollment", enrollmentSchema);
