const mongoose = require("mongoose");

// ==============================
// Student feedback on a course: a 1–5 rating, a comment and what they
// liked or think needs work. One per student per course (editable).
// The course's faculty can reply; other students can mark it helpful.
// ==============================
const ASPECTS = ["Clear explanations", "Good examples", "Useful quizzes", "Right pace", "Too fast", "Too basic", "Needs more practice", "Great reading list"];

const courseFeedbackSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: {
      type: String,
      trim: true,
      default: "",
      maxlength: [1000, "Feedback cannot exceed 1,000 characters"],
    },
    aspects: {
      type: [{ type: String, enum: ASPECTS }],
      default: [],
    },
    // Faculty reply, shown under the feedback.
    reply: {
      text: { type: String, trim: true, maxlength: [1000, "Reply cannot exceed 1,000 characters"] },
      by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      at: { type: Date },
    },
    // Students who found this feedback helpful.
    helpful: {
      type: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

courseFeedbackSchema.index({ course: 1, student: 1 }, { unique: true });
courseFeedbackSchema.index({ course: 1, createdAt: -1 });

courseFeedbackSchema.statics.ASPECTS = ASPECTS;

module.exports = mongoose.model("CourseFeedback", courseFeedbackSchema);
