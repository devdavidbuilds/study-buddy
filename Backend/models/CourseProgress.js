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
    // "Returned" = faculty sent it back for resubmission (feedback explains
    // why); the student's next submission sets it back to "Submitted".
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Submitted", "Evaluated", "Returned"],
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
    // Faculty/admin who last evaluated or returned this submission.
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    feedback: {
      type: String,
      default: "",
    },
    // Optional PDF uploaded with the submission. The file lives in private
    // storage (GridFS or the uploads directory — see utils/submissionFiles)
    // and is only served through the authenticated
    // GET /api/submissions/files/:fileId route.
    file: {
      type: new mongoose.Schema(
        {
          fileId: { type: String, required: true },
          originalName: { type: String, default: "" },
          size: { type: Number, default: 0 },
          mimeType: { type: String, default: "application/pdf" },
          url: { type: String, default: "" },
          // Where the bytes live; older records without it are "local".
          storage: { type: String, enum: ["local", "gridfs"], default: "local" },
          uploadedAt: { type: Date, default: Date.now },
        },
        { _id: false }
      ),
      default: null,
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
// Lesson Check Sub-Schema
// (the per-lesson assessment stored in Course.modules.lessons.quiz,
// scored server-side; one entry per lesson, replaced on retake)
// ==============================
const lessonCheckSchema = new mongoose.Schema(
  {
    moduleId: {
      type: String,
      required: true,
    },
    lessonId: {
      type: String,
      required: true,
    },
    answers: {
      type: [Number],
      default: [],
    },
    correct: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
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
    attempts: {
      type: Number,
      default: 1,
      min: 1,
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
    lessonChecks: {
      type: [lessonCheckSchema],
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
// Look up the owning submission when a PDF is requested.
courseProgressSchema.index({ "assignments.file.fileId": 1 }, { sparse: true });

module.exports = mongoose.model("CourseProgress", courseProgressSchema);
