const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Announcement title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    message: {
      type: String,
      required: [true, "Announcement message is required"],
      trim: true,
      maxlength: [3000, "Message cannot exceed 3000 characters"],
    },
    target: {
      type: String,
      enum: ["all", "students", "faculty"],
      default: "all",
    },
    type: {
      type: String,
      enum: ["info", "warning", "success", "urgent"],
      default: "info",
    },
    category: {
      type: String,
      enum: ["platform", "academic", "event", "general"],
      default: "platform",
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    senderName: {
      type: String,
      default: "Study Buddy Administrator",
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient sorting and lookups by target audience
announcementSchema.index({ target: 1, createdAt: -1 });

module.exports = mongoose.model("Announcement", announcementSchema);
