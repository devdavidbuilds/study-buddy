const Enrollment = require("../models/Enrollment");
const CourseProgress = require("../models/CourseProgress");
const CourseFeedback = require("../models/CourseFeedback");
const LectureMaterial = require("../models/LectureMaterial");
const Assignment = require("../models/Assignment");
const Certificate = require("../models/Certificate");

const DAY = 24 * 60 * 60 * 1000;
const LOOKBACK_DAYS = 30;
const DEADLINE_DAYS = 3;
const MAX_ITEMS = 60;

const courseName = (course) => course?.courseName || course?.title || "your course";
const courseLink = (course) => (course?._id ? `/courses/${course._id}` : "/courses");

// ==============================
// GET /api/notifications — the signed-in student's notifications, built
// from real records of the last 30 days (newest first):
//   enrollment decisions, graded or returned assignments, faculty replies
//   to their feedback, new lecture materials and assignments in approved
//   courses, assignments due within 3 days, and certificates.
// Ids are derived from the source record, so the client can remember
// which ones were read or dismissed.
// ==============================
const getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const since = new Date(now.getTime() - LOOKBACK_DAYS * DAY);
    const soon = new Date(now.getTime() + DEADLINE_DAYS * DAY);

    const approvedCourseIds = await Enrollment.distinct("course", { student: userId, status: "approved" });

    const [decisions, progresses, replies, materials, assignments, certificates] = await Promise.all([
      Enrollment.find({ student: userId, source: "request", status: { $in: ["approved", "rejected"] }, decidedAt: { $gte: since } })
        .populate("course", "courseName title")
        .lean(),
      CourseProgress.find({ user: userId, "assignments.0": { $exists: true } }, "course assignments")
        .populate("course", "courseName title")
        .lean(),
      CourseFeedback.find({ student: userId, "reply.at": { $gte: since } }, "course reply")
        .populate("course", "courseName title")
        .lean(),
      LectureMaterial.find({ course: { $in: approvedCourseIds }, createdAt: { $gte: since } }, "title course createdAt")
        .populate("course", "courseName title")
        .lean(),
      Assignment.find(
        { course: { $in: approvedCourseIds }, status: "Published", $or: [{ createdAt: { $gte: since } }, { dueDate: { $gte: now, $lte: soon } }] },
        "title course dueDate createdAt",
      )
        .populate("course", "courseName title")
        .lean(),
      Certificate.find({ student: userId, issuedAt: { $gte: since } }, "certificateId courseName course issuedAt").lean(),
    ]);

    const items = [];

    for (const e of decisions) {
      const approved = e.status === "approved";
      items.push({
        id: `enrollment-${e._id}-${e.status}`,
        category: "enrollment",
        type: approved ? "success" : "warning",
        title: approved ? "Enrollment approved" : "Enrollment request declined",
        message: approved
          ? `You can now start learning "${courseName(e.course)}".`
          : `Your request for "${courseName(e.course)}" was declined.${e.decisionNote ? ` Note: ${e.decisionNote}` : ""}`,
        link: courseLink(e.course),
        timestamp: e.decidedAt,
      });
    }

    // Which assignments the student has already handed in (for deadline reminders).
    const submitted = new Set();
    for (const p of progresses) {
      for (const a of p.assignments || []) {
        if (a.assignmentId && ["Submitted", "Evaluated"].includes(a.status)) submitted.add(String(a.assignmentId));
        if (!a.evaluatedAt || a.evaluatedAt < since) continue;
        const title = a.title || "Your assignment";
        if (a.status === "Evaluated") {
          items.push({
            id: `graded-${p._id}-${a._id}-${new Date(a.evaluatedAt).getTime()}`,
            category: "assignment",
            type: "success",
            title: "Assignment graded",
            message: `"${title}" in ${courseName(p.course)}: ${a.marks}/${a.maxMarks}${a.feedback ? ` — ${a.feedback}` : ""}`,
            link: "/assignments",
            timestamp: a.evaluatedAt,
          });
        } else if (a.status === "Returned") {
          items.push({
            id: `returned-${p._id}-${a._id}-${new Date(a.evaluatedAt).getTime()}`,
            category: "assignment",
            type: "warning",
            title: "Assignment returned for changes",
            message: `"${title}" in ${courseName(p.course)}${a.feedback ? `: ${a.feedback}` : " needs to be resubmitted."}`,
            link: "/assignments",
            timestamp: a.evaluatedAt,
          });
        }
      }
    }

    for (const f of replies) {
      items.push({
        id: `feedback-reply-${f._id}-${new Date(f.reply.at).getTime()}`,
        category: "feedback",
        type: "info",
        title: "Faculty replied to your feedback",
        message: `${courseName(f.course)}: "${f.reply.text}"`,
        link: courseLink(f.course),
        timestamp: f.reply.at,
      });
    }

    for (const m of materials) {
      // The seeded "Lecture Notes:" PDFs exist for every course; they are not news.
      if (/^Lecture Notes:/i.test(m.title || "")) continue;
      items.push({
        id: `material-${m._id}`,
        category: "material",
        type: "info",
        title: "New lecture material",
        message: `"${m.title}" was added to ${courseName(m.course)}.`,
        link: courseLink(m.course),
        timestamp: m.createdAt,
      });
    }

    for (const a of assignments) {
      if (a.createdAt >= since) {
        items.push({
          id: `assignment-${a._id}`,
          category: "assignment",
          type: "info",
          title: "New assignment",
          message: `"${a.title}" in ${courseName(a.course)}${a.dueDate ? `, due ${new Date(a.dueDate).toDateString()}` : ""}.`,
          link: "/assignments",
          timestamp: a.createdAt,
        });
      }
      if (a.dueDate && a.dueDate >= now && a.dueDate <= soon && !submitted.has(String(a._id))) {
        const hours = Math.max(1, Math.round((new Date(a.dueDate) - now) / (60 * 60 * 1000)));
        items.push({
          id: `deadline-${a._id}`,
          category: "deadline",
          type: "warning",
          title: "Assignment due soon",
          message: `"${a.title}" in ${courseName(a.course)} is due in ${hours < 48 ? `${hours} hour${hours === 1 ? "" : "s"}` : `${Math.round(hours / 24)} days`}.`,
          link: "/assignments",
          timestamp: now,
        });
      }
    }

    for (const c of certificates) {
      items.push({
        id: `certificate-${c._id}`,
        category: "certificate",
        type: "success",
        title: "Certificate earned",
        message: `You completed "${c.courseName}". Your certificate ${c.certificateId} is ready to download.`,
        link: "/achievements",
        timestamp: c.issuedAt,
      });
    }

    items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.status(200).json({ success: true, count: Math.min(items.length, MAX_ITEMS), data: items.slice(0, MAX_ITEMS) });
  } catch (error) {
    console.error("Get Notifications Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to load notifications." });
  }
};

module.exports = { getNotifications };
