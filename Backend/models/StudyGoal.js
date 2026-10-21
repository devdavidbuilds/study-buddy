const mongoose = require("mongoose");

// ==============================
// Study Goal Schema
//
// How much time per week a student wants to spend preparing for a course.
// The planner compares this target against the sessions scheduled and
// completed in the visible week. One goal per student per course.
// ==============================

const studyGoalSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    courseName: { type: String, required: true, trim: true },
    courseCode: { type: String, default: "", trim: true },

    weeklyMinutes: {
      type: Number,
      required: true,
      min: [15, "Weekly goal must be at least 15 minutes"],
      max: [4200, "Weekly goal cannot exceed 70 hours"],
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

studyGoalSchema.index({ student: 1, course: 1 }, { unique: true });

module.exports = mongoose.model("StudyGoal", studyGoalSchema);
