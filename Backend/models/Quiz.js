const mongoose = require("mongoose");

// ==============================
// Quiz Question Sub-Schema
// ==============================
const quizQuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    // Exactly 4 options, validated in the controller (and re-checked here
    // as a schema-level safety net).
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length === 4,
        message: "Each question must have exactly 4 options.",
      },
    },

    // Index (0-3) into `options` — the correct answer is stored server-side
    // only and is never sent to students by any student-facing endpoint.
    correctAnswerIndex: {
      type: Number,
      required: true,
      min: 0,
      max: 3,
    },

    marks: {
      type: Number,
      required: true,
      min: [0.01, "Marks must be a positive value"],
      default: 1,
    },
  },
  { _id: false }
);

// ==============================
// Quiz Schema
// ==============================
const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Quiz title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    moduleId: {
      type: String,
      required: [true, "Module ID is required"],
    },

    lessonId: {
      type: String,
      required: [true, "Lesson ID is required"],
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    questions: {
      type: [quizQuestionSchema],
      default: [],
      validate: {
        validator: (arr) => Array.isArray(arr) && arr.length > 0,
        message: "A quiz must have at least one question.",
      },
    },

    // Optional overall time limit, in minutes.
    timeLimit: {
      type: Number,
      default: null,
      min: [1, "Time limit must be at least 1 minute"],
    },

    totalMarks: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Draft", "Published", "Closed"],
      default: "Published",
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Index for quick lookups
quizSchema.index({ course: 1, moduleId: 1, lessonId: 1 });
quizSchema.index({ faculty: 1 });

module.exports = mongoose.model("Quiz", quizSchema);
