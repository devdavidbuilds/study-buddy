const mongoose = require("mongoose");

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
          answer: {
            type: String,
            default: "",
          },
        },
      ],
      default: [],
    },
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
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Course", courseSchema);