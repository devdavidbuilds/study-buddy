const mongoose = require("mongoose");

// ==============================
// Content Generation Job
//
// One document per course processed by the content pipeline
// (scripts/enrichCourses.js). It makes the pipeline resumable and
// reversible:
//   - `draft` holds generated-but-unsaved work, so an interrupted run
//     continues from the last finished lesson group instead of starting
//     over (and paying for the same generation twice);
//   - `backup` holds the course's original modules/duration/outcomes
//     (gzipped JSON), captured once before the first write and never
//     overwritten, so scripts/rollbackCourseContent.js can restore them.
// ==============================

const JOB_STATUSES = ["pending", "in_progress", "completed", "failed", "skipped", "rolled_back"];

const contentGenerationJobSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      unique: true,
    },
    courseCode: { type: String, default: "" },
    status: { type: String, enum: JOB_STATUSES, default: "pending", index: true },
    contentVersion: { type: Number, default: 0 },
    subjectProfile: { type: String, default: "" },
    provider: { type: String, default: "" },
    model: { type: String, default: "" },

    attempts: { type: Number, default: 0 },
    lastError: { type: String, default: "" },
    errorLog: {
      type: [{ at: Date, stage: String, message: String, _id: false }],
      default: [],
    },

    // Concurrency guard: only one runner may work on a course at a time.
    lockId: { type: String, default: null },
    lockedAt: { type: Date, default: null },

    draft: {
      curriculum: { type: mongoose.Schema.Types.Mixed, default: null },
      // "moduleIndex.lessonIndex" -> normalized lesson object
      lessons: { type: mongoose.Schema.Types.Mixed, default: {} },
      lessonWarnings: { type: mongoose.Schema.Types.Mixed, default: {} },
    },

    qualityScore: { type: Number, default: null },
    warnings: { type: [String], default: [] },
    stats: {
      calls: { type: Number, default: 0 },
      inputTokens: { type: Number, default: 0 },
      outputTokens: { type: Number, default: 0 },
    },

    backup: {
      data: { type: Buffer, default: null }, // gzip(JSON {modules, duration, outcomes, contentMeta})
      takenAt: { type: Date, default: null },
      sourceUpdatedAt: { type: Date, default: null },
    },

    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    rolledBackAt: { type: Date, default: null },
  },
  {
    timestamps: true,
    versionKey: false,
    minimize: false,
  }
);

contentGenerationJobSchema.statics.JOB_STATUSES = JOB_STATUSES;

module.exports = mongoose.model("ContentGenerationJob", contentGenerationJobSchema);
