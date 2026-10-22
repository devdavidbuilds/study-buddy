const mongoose = require("mongoose");
const CourseFeedback = require("../models/CourseFeedback");
const Course = require("../models/Course");
const { isApprovedStudent } = require("../utils/enrollment");

// "Aarav Sharma" -> "Aarav S." on the public course page.
const publicName = (fullName) => {
  const parts = String(fullName || "Student").trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
};

const summarize = (items) => {
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  const aspects = {};
  for (const f of items) {
    distribution[f.rating] += 1;
    for (const a of f.aspects || []) aspects[a] = (aspects[a] || 0) + 1;
  }
  return {
    count: items.length,
    average: items.length ? Math.round((items.reduce((s, f) => s + f.rating, 0) / items.length) * 10) / 10 : null,
    distribution,
    aspects: Object.entries(aspects).sort((a, b) => b[1] - a[1]).map(([label, count]) => ({ label, count })),
  };
};

const shape = (f, viewerId) => ({
  _id: f._id,
  rating: f.rating,
  comment: f.comment,
  aspects: f.aspects || [],
  studentName: publicName(f.student?.fullName),
  isMine: String(f.student?._id || f.student) === String(viewerId),
  helpfulCount: (f.helpful || []).length,
  helpedByMe: (f.helpful || []).some((id) => String(id) === String(viewerId)),
  reply: f.reply?.text ? { text: f.reply.text, byName: f.reply.by?.fullName || "Course faculty", at: f.reply.at } : null,
  createdAt: f.createdAt,
  edited: f.updatedAt && f.createdAt && new Date(f.updatedAt) - new Date(f.createdAt) > 60000 && !f.reply?.at,
});

// ==============================
// GET /api/feedback/course/:courseId?sort=recent|helpful|high|low
// ==============================
const getCourseFeedback = async (req, res) => {
  try {
    const items = await CourseFeedback.find({ course: req.params.courseId })
      .populate("student", "fullName")
      .populate("reply.by", "fullName")
      .lean();
    const sorters = {
      helpful: (a, b) => (b.helpful || []).length - (a.helpful || []).length || new Date(b.createdAt) - new Date(a.createdAt),
      high: (a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt),
      low: (a, b) => a.rating - b.rating || new Date(b.createdAt) - new Date(a.createdAt),
      recent: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    };
    items.sort(sorters[req.query.sort] || sorters.recent);

    const viewer = req.user._id;
    const mine = items.find((f) => String(f.student?._id) === String(viewer));
    const canPost = req.user.role === "student" && (await isApprovedStudent(viewer, req.params.courseId));

    res.status(200).json({
      success: true,
      data: {
        summary: summarize(items),
        items: items.map((f) => shape(f, viewer)),
        mine: mine ? { _id: mine._id, rating: mine.rating, comment: mine.comment, aspects: mine.aspects || [] } : null,
        canPost,
        aspects: CourseFeedback.ASPECTS,
      },
    });
  } catch (error) {
    console.error("Course Feedback Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to load feedback." });
  }
};

// ==============================
// PUT /api/feedback/course/:courseId  { rating, comment, aspects }  (student)
// Creates or updates the student's own feedback; needs an approved enrollment.
// ==============================
const saveMyFeedback = async (req, res) => {
  try {
    if (!(await isApprovedStudent(req.user._id, req.params.courseId))) {
      return res.status(403).json({ success: false, message: "Only students enrolled in this course can leave feedback." });
    }
    const rating = Number(req.body?.rating);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Please choose a rating from 1 to 5 stars." });
    }
    const comment = typeof req.body.comment === "string" ? req.body.comment.trim() : "";
    if (comment.length > 1000) {
      return res.status(400).json({ success: false, message: "Feedback cannot exceed 1,000 characters." });
    }
    const aspects = Array.isArray(req.body.aspects)
      ? [...new Set(req.body.aspects.filter((a) => CourseFeedback.ASPECTS.includes(a)))]
      : [];

    const feedback = await CourseFeedback.findOneAndUpdate(
      { course: req.params.courseId, student: req.user._id },
      { $set: { rating, comment, aspects } },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );
    res.status(200).json({ success: true, message: "Thanks for your feedback!", data: feedback });
  } catch (error) {
    console.error("Save Feedback Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to save your feedback." });
  }
};

// ==============================
// DELETE /api/feedback/course/:courseId  (student, own feedback)
// ==============================
const deleteMyFeedback = async (req, res) => {
  try {
    const result = await CourseFeedback.deleteOne({ course: req.params.courseId, student: req.user._id });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "No feedback to delete." });
    res.status(200).json({ success: true, message: "Feedback deleted." });
  } catch (error) {
    console.error("Delete Feedback Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to delete your feedback." });
  }
};

// ==============================
// POST /api/feedback/:id/helpful  — toggle "helpful" (students, not on own)
// ==============================
const toggleHelpful = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ success: false, message: "Invalid id." });
    const feedback = await CourseFeedback.findById(req.params.id).select("student helpful");
    if (!feedback) return res.status(404).json({ success: false, message: "Feedback not found." });
    if (String(feedback.student) === String(req.user._id)) {
      return res.status(400).json({ success: false, message: "You can't mark your own feedback as helpful." });
    }
    const already = feedback.helpful.some((id) => String(id) === String(req.user._id));
    await CourseFeedback.updateOne({ _id: feedback._id }, already ? { $pull: { helpful: req.user._id } } : { $addToSet: { helpful: req.user._id } }, { timestamps: false });
    res.status(200).json({ success: true, data: { helpedByMe: !already, helpfulCount: feedback.helpful.length + (already ? -1 : 1) } });
  } catch (error) {
    console.error("Helpful Feedback Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to update." });
  }
};

// ==============================
// Faculty/admin: GET /api/feedback/faculty?status=all|unreplied|replied&rating=1..5&courseId=
// Feedback on the faculty member's courses (admin: all) with full student details.
// ==============================
const getFacultyFeedback = async (req, res) => {
  try {
    const scope = {};
    if (req.user.role !== "admin") {
      scope.course = { $in: (await Course.find({ faculty: req.user._id }).select("_id").lean()).map((c) => c._id) };
    }
    const all = await CourseFeedback.find(scope)
      .sort({ createdAt: -1 })
      .populate("student", "fullName email rollNumber department yearOfStudy")
      .populate("course", "courseName courseCode thumbnail")
      .populate("reply.by", "fullName")
      .lean();

    const { status, rating, courseId } = req.query;
    const items = all.filter((f) =>
      (!courseId || String(f.course?._id) === String(courseId)) &&
      (!rating || f.rating === Number(rating)) &&
      (status === "unreplied" ? !f.reply?.text : status === "replied" ? Boolean(f.reply?.text) : true)
    );

    const perCourse = new Map();
    for (const f of all) {
      if (!f.course) continue;
      const key = String(f.course._id);
      const row = perCourse.get(key) || { courseId: f.course._id, courseName: f.course.courseName, count: 0, total: 0, unreplied: 0 };
      row.count += 1;
      row.total += f.rating;
      if (!f.reply?.text) row.unreplied += 1;
      perCourse.set(key, row);
    }

    res.status(200).json({
      success: true,
      data: {
        summary: { ...summarize(all), unreplied: all.filter((f) => !f.reply?.text).length },
        courses: [...perCourse.values()]
          .map((c) => ({ ...c, average: Math.round((c.total / c.count) * 10) / 10 }))
          .sort((a, b) => b.count - a.count),
        items: items
          .filter((f) => f.course && f.student)
          .map((f) => ({
            _id: f._id,
            rating: f.rating,
            comment: f.comment,
            aspects: f.aspects || [],
            helpfulCount: (f.helpful || []).length,
            createdAt: f.createdAt,
            course: { _id: f.course._id, courseName: f.course.courseName, thumbnail: f.course.thumbnail },
            student: { fullName: f.student.fullName, email: f.student.email, rollNumber: f.student.rollNumber, department: f.student.department, yearOfStudy: f.student.yearOfStudy },
            reply: f.reply?.text ? { text: f.reply.text, byName: f.reply.by?.fullName || "", at: f.reply.at } : null,
          })),
      },
    });
  } catch (error) {
    console.error("Faculty Feedback Error:", error);
    res.status(500).json({ success: false, message: "Unable to load feedback." });
  }
};

// ==============================
// Faculty/admin: PUT /api/feedback/:id/reply { text }   DELETE removes the reply
// ==============================
const loadOwnedFeedback = async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, message: "Invalid id." });
    return null;
  }
  const feedback = await CourseFeedback.findById(req.params.id);
  if (!feedback) {
    res.status(404).json({ success: false, message: "Feedback not found." });
    return null;
  }
  const course = await Course.findById(feedback.course).select("faculty").lean();
  if (req.user.role !== "admin" && String(course?.faculty) !== String(req.user._id)) {
    res.status(403).json({ success: false, message: "Only this course's faculty can reply." });
    return null;
  }
  return feedback;
};

const replyToFeedback = async (req, res) => {
  try {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ success: false, message: "Please write a reply." });
    if (text.length > 1000) return res.status(400).json({ success: false, message: "Reply cannot exceed 1,000 characters." });
    const feedback = await loadOwnedFeedback(req, res);
    if (!feedback) return;
    feedback.reply = { text, by: req.user._id, at: new Date() };
    await feedback.save({ timestamps: false });
    res.status(200).json({ success: true, message: "Reply posted.", data: { text, byName: req.user.fullName, at: feedback.reply.at } });
  } catch (error) {
    console.error("Reply Feedback Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to post the reply." });
  }
};

const deleteReply = async (req, res) => {
  try {
    const feedback = await loadOwnedFeedback(req, res);
    if (!feedback) return;
    feedback.reply = undefined;
    await feedback.save({ timestamps: false });
    res.status(200).json({ success: true, message: "Reply removed." });
  } catch (error) {
    console.error("Delete Reply Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to remove the reply." });
  }
};

module.exports = {
  getCourseFeedback,
  saveMyFeedback,
  deleteMyFeedback,
  toggleHelpful,
  getFacultyFeedback,
  replyToFeedback,
  deleteReply,
};
