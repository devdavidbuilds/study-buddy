const mongoose = require("mongoose");

// ==============================
// Assignment Sub-Schema
// ==============================
const assignmentEntrySchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "",
    },
    answer: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Submitted", "Evaluated"],
      default: "Not Started",
    },
    marks: {
      type: Number,
      default: 0,
    },
    maxMarks: {
      type: Number,
      default: 10,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    evaluatedAt: {
      type: Date,
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

// ==============================
// Completed Lesson Sub-Schema
// ==============================
const completedLessonSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ==============================
// Course Progress Schema
// ==============================
const courseProgressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    completedLessons: {
      type: [completedLessonSchema],
      default: [],
    },
    assignments: {
      type: [assignmentEntrySchema],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// One progress document per student per course
courseProgressSchema.index({ user: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
