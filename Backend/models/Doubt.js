const mongoose = require("mongoose");

// ==============================
// Doubt: A question/doubt posted by a student on a specific course or lesson.
// The course's faculty (or admin) can reply, resolving the doubt.
// ==============================
const doubtSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    title: {
      type: String,
      required: [true, "Please provide a title for your question"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    question: {
      type: String,
      required: [true, "Please describe your question or doubt"],
      trim: true,
      maxlength: [4000, "Question cannot exceed 4,000 characters"],
    },
    lessonTitle: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
    reply: {
      text: {
        type: String,
        trim: true,
        maxlength: [4000, "Reply cannot exceed 4,000 characters"],
      },
      repliedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      repliedAt: {
        type: Date,
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

doubtSchema.index({ course: 1, createdAt: -1 });
doubtSchema.index({ student: 1, createdAt: -1 });
doubtSchema.index({ faculty: 1, status: 1 });

module.exports = mongoose.model("Doubt", doubtSchema);
