const mongoose = require("mongoose");

// ==============================
// Study Session Schema
//
// A block of time a student has set aside in the Study Planner to prepare
// for one course. `date` is a calendar day ("YYYY-MM-DD") and `startTime`
// a wall-clock time ("HH:MM") in the student's own timezone, stored as
// strings so a session never shifts day when server and browser disagree
// on timezone.
//
// courseName / courseCode are snapshots so the planner can render a week
// without populating every course (some faculty own thousands).
// ==============================

const studySessionSchema = new mongoose.Schema(
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

    courseName: { type: String, required: true, trim: true },
    courseCode: { type: String, default: "", trim: true },

    moduleId: { type: String, default: "", trim: true },
    moduleName: { type: String, default: "", trim: true },

    title: {
      type: String,
      trim: true,
      default: "",
      maxlength: [120, "Topic cannot exceed 120 characters"],
    },

    notes: {
      type: String,
      trim: true,
      default: "",
      maxlength: [500, "Notes cannot exceed 500 characters"],
    },

    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"],
    },

    startTime: {
      type: String,
      required: true,
      match: [/^([01]\d|2[0-3]):[0-5]\d$/, "Start time must be HH:MM"],
    },

    durationMinutes: {
      type: Number,
      required: true,
      min: [15, "A session must be at least 15 minutes"],
      max: [480, "A session cannot exceed 8 hours"],
    },

    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

studySessionSchema.index({ student: 1, date: 1, startTime: 1 });

module.exports = mongoose.model("StudySession", studySessionSchema);
