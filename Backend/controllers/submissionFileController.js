const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const { FILE_ID_PATTERN, openStoredFile, cleanOriginalName } = require("../utils/submissionFiles");

// ==============================
// Stream a submitted assignment PDF
// GET /api/submissions/files/:fileId[?download=1]
//
// Allowed: the student who submitted it, the faculty member who owns the
// course, or an admin. Everyone else gets 404 so file ids cannot be probed.
// ==============================
const getSubmissionFile = async (req, res) => {
  try {
    const { fileId } = req.params;
    if (!FILE_ID_PATTERN.test(String(fileId))) {
      return res.status(404).json({ success: false, message: "File not found." });
    }

    const progress = await CourseProgress.findOne(
      { "assignments.file.fileId": fileId },
      { user: 1, course: 1, assignments: { $elemMatch: { "file.fileId": fileId } } }
    ).lean();
    const entry = progress?.assignments?.[0];

    if (!progress || !entry?.file) {
      return res.status(404).json({ success: false, message: "File not found." });
    }

    const user = req.user;
    let allowed = user.role === "admin" || String(progress.user) === String(user._id);
    if (!allowed && user.role === "faculty") {
      const course = await Course.findById(progress.course).select("faculty").lean();
      allowed = Boolean(course) && String(course.faculty) === String(user._id);
    }
    if (!allowed) {
      return res.status(404).json({ success: false, message: "File not found." });
    }

    const stored = await openStoredFile(entry.file);
    if (!stored) {
      return res.status(404).json({
        success: false,
        message: "The PDF for this submission is no longer available on the server.",
      });
    }

    const name = cleanOriginalName(entry.file.originalName);
    const asciiName = name.replace(/[^\x20-\x7e]/g, "_");
    const disposition = req.query.download === "1" ? "attachment" : "inline";

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": stored.size,
      "Content-Disposition": `${disposition}; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(name)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    });

    stored.stream
      .on("error", (error) => {
        console.error("Submission file stream error:", error.message);
        if (!res.headersSent) res.status(500).end();
        else res.destroy(error);
      })
      .pipe(res);
  } catch (error) {
    console.error("Get Submission File Error:", error);
    res.status(500).json({ success: false, message: "Could not load the PDF." });
  }
};

module.exports = { getSubmissionFile };
