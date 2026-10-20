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
    // Reference to the faculty-created Assignment document, when this
    // submission is for a real assignment (as opposed to the legacy
    // auto-generated lesson prompt, which only used `answer`).
    assignmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      default: null,
    },
    title: {
      type: String,
      default: "",
    },
    // Legacy free-text answer (auto-generated lesson prompt flow).
    answer: {
      type: String,
      default: "",
    },
    // Per-question answers for a real Assignment (index-aligned with
    // Assignment.questions).
    answers: {
      type: [String],
      default: [],
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
// Quiz Attempt Sub-Schema
// ==============================
const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    moduleId: {
      type: String,
      required: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    correctAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
      min: 0,
    },
    submittedAt: {
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
    quizAttempts: {
      type: [quizAttemptSchema],
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
