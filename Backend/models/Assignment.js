const mongoose = require("mongoose");

// ==============================
// Question Sub-Schema
// ==============================
const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["text", "mcq", "code"],
      default: "text",
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
      default: "",
    },
    marks: {
      type: Number,
      default: 1,
      min: 0,
    },
  },
  { _id: false }
);

// ==============================
// Assignment Schema
// ==============================
const assignmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Assignment title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    instructions: {
      type: String,
      default: "",
      maxlength: 5000,
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
      type: [questionSchema],
      default: [],
    },

    totalMarks: {
      type: Number,
      default: 10,
      min: 0,
    },

    dueDate: {
      type: Date,
      default: null,
    },

    resources: {
      type: [String],
      default: [],
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
assignmentSchema.index({ course: 1, moduleId: 1, lessonId: 1 });
assignmentSchema.index({ faculty: 1 });

module.exports = mongoose.model("Assignment", assignmentSchema);
