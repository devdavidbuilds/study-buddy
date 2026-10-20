const mongoose = require("mongoose");

// ==============================
// Lecture material uploaded by faculty for a course (optionally a module).
// The file itself lives in GridFS (bucket "lectureMaterials", see
// utils/lectureMaterialFiles) and is served by the authenticated
// GET /api/materials/:id/file route.
// ==============================
const lectureMaterialSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },

    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },

    // Optional module/unit within the course ("" = whole course).
    moduleId: {
      type: String,
      default: "",
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    file: {
      type: new mongoose.Schema(
        {
          fileId: { type: String, required: true },
          originalName: { type: String, default: "" },
          size: { type: Number, default: 0 },
          mimeType: { type: String, required: true },
          kind: { type: String, enum: ["pdf", "ppt", "pptx"], required: true },
        },
        { _id: false }
      ),
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

lectureMaterialSchema.index({ course: 1, moduleId: 1, createdAt: -1 });
lectureMaterialSchema.index({ "file.fileId": 1 });

module.exports = mongoose.model("LectureMaterial", lectureMaterialSchema);
