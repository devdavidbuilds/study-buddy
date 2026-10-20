const mongoose = require("mongoose");

// ==============================
// Student Activity Schema
//
// A lightweight, append-only log of meaningful learning events for a
// student. This is intentionally separate from CourseProgress (which
// holds current-state data like "is this lesson done") — this collection
// holds a historical trail of *events* so faculty can later see how and
// when a student engaged with a course.
//
// Records are only ever created by:
//   - server-side controllers, right after an authoritative state change
//     (lesson completed, assignment submitted, assignment evaluated), or
//   - the activity controller's own "view" endpoint, for simple
//     course/lesson "opened" events, which carries no grading data and
//     cannot forge any other activity type.
//
// The student identity is always taken from the authenticated JWT user
// (req.user._id) by the calling controller — never from client input.
// ==============================

const ACTIVITY_TYPES = [
  "COURSE_OPENED",
  "LESSON_OPENED",
  "LESSON_COMPLETED",
  "ASSIGNMENT_SUBMITTED",
  "ASSIGNMENT_EVALUATED",
  // Written by the student quiz submission flow when an attempt is completed.
  "QUIZ_ATTEMPTED",
  "QUIZ_COMPLETED",
  "QUIZ_SCORE_RECEIVED",
];

const studentActivitySchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    activityType: {
      type: String,
      enum: ACTIVITY_TYPES,
      required: true,
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: null,
    },

    moduleId: {
      type: String,
      default: null,
    },

    lessonId: {
      type: String,
      default: null,
    },

    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment",
      default: null,
    },

    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      default: null,
    },

    // Small, event-specific result info — e.g. { marks, maxMarks } for an
    // evaluation, or { title } for a course/lesson view. Never store
    // sensitive auth data here.
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true, // createdAt = activity timestamp
    versionKey: false,
  }
);

// Fast "recent activity for this student" queries (used by the student's
// own activity feed).
studentActivitySchema.index({ student: 1, createdAt: -1 });

// Fast "this student's activity for this course" queries (future faculty
// analytics; harmless to have now).
studentActivitySchema.index({ student: 1, course: 1, createdAt: -1 });

studentActivitySchema.statics.ACTIVITY_TYPES = ACTIVITY_TYPES;

module.exports = mongoose.model("StudentActivity", studentActivitySchema);
