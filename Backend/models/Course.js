const mongoose = require("mongoose");

<<<<<<< HEAD
// ==============================
// Structured lesson content (written by the course content pipeline —
// see services/courseContent). Optional: lessons without it keep working
// with the plain `content` / `description` fields.
// ==============================
const learningSchema = new mongoose.Schema(
  {
    // "final-assessment" for the course-wide review + test lesson; unset
    // for ordinary lessons.
    kind: { type: String },
    objectives: { type: [String], default: [] },
    // Markdown. Also copied into lesson.content so existing renderers and
    // the AI Tutor keep working.
    explanation: { type: String, default: "" },
    concepts: {
      type: [{ term: String, definition: String, _id: false }],
      default: [],
    },
    examples: {
      type: [
        {
          title: String,
          scenario: String,
          steps: [String],
          solution: String,
          code: String,
          language: String,
          _id: false,
        },
      ],
      default: [],
    },
    applications: { type: [String], default: [] },
    mistakes: {
      type: [{ mistake: String, fix: String, _id: false }],
      default: [],
    },
    tips: { type: [String], default: [] },
    takeaways: { type: [String], default: [] },
    revisionNotes: { type: String, default: "" },
    // Self-check activities; model answers are shown on request (ungraded).
    practice: {
      type: [{ type: { type: String }, prompt: String, hint: String, answer: String, _id: false }],
      default: [],
    },
  },
  { _id: false }
);

=======
>>>>>>> origin/main
const lessonSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    duration: {
      type: String,
      default: "30 min",
    },
    done: {
      type: Boolean,
      default: false,
    },
    codeFile: {
      type: String,
      default: "",
    },
    description: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    videoUrl: {
      type: String,
      default: "",
    },
    resources: {
      type: [String],
      default: [],
    },
    quiz: {
      type: [
        {
          question: {
            type: String,
            default: "",
          },
          options: {
            type: [String],
            default: [],
          },
<<<<<<< HEAD
          // Correct option text. Never sent to students — the lesson
          // check is scored server-side (progressController).
=======
>>>>>>> origin/main
          answer: {
            type: String,
            default: "",
          },
<<<<<<< HEAD
          explanation: {
            type: String,
            default: "",
          },
=======
>>>>>>> origin/main
        },
      ],
      default: [],
    },
<<<<<<< HEAD
    estimatedMinutes: {
      type: Number,
      default: 0,
      min: 0,
    },
    learning: {
      type: learningSchema,
      default: undefined,
    },
=======
>>>>>>> origin/main
  },
  { _id: false }
);

const moduleSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
<<<<<<< HEAD
    summary: {
      type: String,
      default: "",
    },
=======
>>>>>>> origin/main
    lessons: {
      type: [lessonSchema],
      default: [],
    },
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    courseName: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
      minlength: [3, "Course name must be at least 3 characters"],
      maxlength: [100, "Course name cannot exceed 100 characters"],
    },

    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      trim: true,
    },

    department: {
      type: String,
      required: true,
      enum: ["CSE", "IT", "ECE", "EEE", "MECH", "CIVIL"],
    },

    semester: {
      type: Number,
      required: true,
      min: 1,
      max: 8,
    },

    description: {
      type: String,
      default: "",
      maxlength: 500,
    },

    thumbnail: {
      type: String,
      default: "📘",
    },

    category: {
      type: String,
      default: "Programming",
    },

    level: {
      type: String,
      enum: ["Beginner", "Intermediate", "Advanced"],
      default: "Beginner",
    },

    duration: {
      type: String,
      default: "4 weeks",
    },

    color: {
      type: String,
      default: "#E75480",
    },

    skills: {
      type: [String],
      default: [],
    },

    outcomes: {
      type: [String],
      default: [],
    },

    modules: {
      type: [moduleSchema],
      default: [],
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    students: {
      type: Number,
      default: 0,
      min: 0,
    },

    reviewsCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    certificate: {
      type: Boolean,
      default: true,
    },

    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Archived"],
      default: "Active",
    },
<<<<<<< HEAD

    // Set by the course content pipeline when structured content is saved.
    contentMeta: {
      type: new mongoose.Schema(
        {
          version: Number,
          generatedAt: Date,
          provider: String,
          model: String,
          subjectProfile: String,
          qualityScore: Number,
          estimatedMinutes: Number,
          summary: String,
          audience: String,
          prerequisites: [String],
        },
        { _id: false }
      ),
      default: undefined,
    },
=======
>>>>>>> origin/main
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Course", courseSchema);