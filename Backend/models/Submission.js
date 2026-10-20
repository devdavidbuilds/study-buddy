const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },

    problemId: {
      type: String,
      required: true,
      index: true,
    },

    language: {
      type: String,
      required: true,
      enum: ["c", "cpp", "python"],
    },

    code: {
      type: String,
      required: true,
    },

    verdict: {
      type: String,
      required: true,
      enum: [
        "Accepted",
        "Wrong Answer",
        "Compilation Error",
        "Runtime Error",
        "Time Limit Exceeded",
        "Memory Limit Exceeded",
        "Presentation Error",
        "Error",
        "All Test Cases Passed",
        "Some Test Cases Failed",
      ],
    },

    passedCount: {
      type: Number,
      default: 0,
    },

    totalCount: {
      type: Number,
      default: 0,
    },

    executionTime: {
      type: Number, // in milliseconds
      default: 0,
    },

    memoryUsed: {
      type: Number, // in MB
      default: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

// Compound index for querying user's submissions on a problem
submissionSchema.index({ userId: 1, problemId: 1, createdAt: -1 });

module.exports = mongoose.model("Submission", submissionSchema);
