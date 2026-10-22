const mongoose = require("mongoose");

// ==============================
// A personal study note. Private to its owner: every query is scoped to
// the authenticated user (req.user._id), never to an id from the request.
// ==============================
const noteSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [120, "Title cannot exceed 120 characters"],
    },
    course: {
      type: String,
      default: "General",
      trim: true,
      maxlength: [120, "Course cannot exceed 120 characters"],
    },
    content: {
      type: String,
      default: "",
      maxlength: [5000, "Note cannot exceed 5,000 characters"],
    },
    color: {
      type: String,
      default: "#F8C8DC",
      match: [/^#[0-9a-fA-F]{6}$/, "Color must be a hex value"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

noteSchema.index({ owner: 1, updatedAt: -1 });

module.exports = mongoose.model("Note", noteSchema);
