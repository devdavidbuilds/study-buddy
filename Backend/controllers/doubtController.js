const Course = require("../models/Course");
const Doubt = require("../models/Doubt");

// ==============================
// POST /api/doubts — Student creates a new question/doubt
// ==============================
const createDoubt = async (req, res) => {
  try {
    const { courseId, title, question, lessonTitle } = req.body || {};

    if (!courseId) {
      return res.status(400).json({ success: false, message: "Course ID is required." });
    }
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Please provide a question title." });
    }
    if (!question || !question.trim()) {
      return res.status(400).json({ success: false, message: "Please enter your question details." });
    }

    const course = await Course.findById(courseId).select("faculty courseName title").lean();
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    const doubt = await Doubt.create({
      course: courseId,
      student: req.user._id,
      faculty: course.faculty || null,
      title: title.trim(),
      question: question.trim(),
      lessonTitle: (lessonTitle || "").trim(),
      status: "pending",
    });

    const populated = await Doubt.findById(doubt._id)
      .populate("student", "fullName email role department")
      .populate("course", "courseName title")
      .lean();

    return res.status(201).json({
      success: true,
      message: "Your doubt has been submitted to the faculty.",
      data: populated,
    });
  } catch (error) {
    console.error("Create Doubt Error:", error);
    return res.status(500).json({ success: false, message: "Unable to submit doubt." });
  }
};

// ==============================
// GET /api/doubts/course/:courseId — Doubts for a specific course
// ==============================
const getCourseDoubts = async (req, res) => {
  try {
    const { courseId } = req.params;
    const doubts = await Doubt.find({ course: courseId })
      .populate("student", "fullName email role department")
      .populate("reply.repliedBy", "fullName role department")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: doubts,
    });
  } catch (error) {
    console.error("Get Course Doubts Error:", error);
    return res.status(500).json({ success: false, message: "Unable to fetch course doubts." });
  }
};

// ==============================
// GET /api/doubts/my — Student's own doubts across courses
// ==============================
const getMyDoubts = async (req, res) => {
  try {
    const doubts = await Doubt.find({ student: req.user._id })
      .populate("course", "courseName title")
      .populate("reply.repliedBy", "fullName role department")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      data: doubts,
    });
  } catch (error) {
    console.error("Get My Doubts Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load your doubts." });
  }
};

// ==============================
// GET /api/doubts/faculty — Doubts for faculty's courses (or all for admin)
// ==============================
const getFacultyDoubts = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const { status = "all", courseId } = req.query;

    let courseFilter = {};
    if (!isAdmin) {
      const myCourses = await Course.find({ faculty: req.user._id }).select("_id").lean();
      const myCourseIds = myCourses.map((c) => c._id);
      courseFilter = { $in: myCourseIds };
    }

    const query = {};
    if (!isAdmin) {
      query.course = courseFilter;
    }

    if (courseId) {
      query.course = courseId;
    }

    if (status === "pending" || status === "resolved") {
      query.status = status;
    }

    const [items, allForCounts, courses] = await Promise.all([
      Doubt.find(query)
        .populate("student", "fullName email department rollNumber")
        .populate("course", "courseName title")
        .populate("reply.repliedBy", "fullName")
        .sort({ status: 1, createdAt: -1 })
        .lean(),
      Doubt.find(isAdmin ? {} : { course: courseFilter }).select("status").lean(),
      Course.find(isAdmin ? {} : { faculty: req.user._id }).select("courseName title _id").lean(),
    ]);

    const summary = {
      total: allForCounts.length,
      pending: allForCounts.filter((d) => d.status === "pending").length,
      resolved: allForCounts.filter((d) => d.status === "resolved").length,
    };

    return res.status(200).json({
      success: true,
      data: {
        items,
        summary,
        courses,
      },
    });
  } catch (error) {
    console.error("Get Faculty Doubts Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load student doubts." });
  }
};

// ==============================
// PUT /api/doubts/:id/reply — Faculty or admin replies to a student doubt
// ==============================
const replyToDoubt = async (req, res) => {
  try {
    const { id } = req.params;
    const { text } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({ success: false, message: "Reply text is required." });
    }

    const doubt = await Doubt.findById(id).populate("course", "faculty courseName title");
    if (!doubt) {
      return res.status(404).json({ success: false, message: "Doubt not found." });
    }

    const isCourseFaculty = String(doubt.course?.faculty) === String(req.user._id);
    const isAdmin = req.user.role === "admin";

    if (!isCourseFaculty && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You can only reply to doubts for courses you teach.",
      });
    }

    doubt.reply = {
      text: text.trim(),
      repliedBy: req.user._id,
      repliedAt: new Date(),
    };
    doubt.status = "resolved";

    await doubt.save();

    const updated = await Doubt.findById(id)
      .populate("student", "fullName email department")
      .populate("course", "courseName title")
      .populate("reply.repliedBy", "fullName role department")
      .lean();

    return res.status(200).json({
      success: true,
      message: "Reply posted successfully.",
      data: updated,
    });
  } catch (error) {
    console.error("Reply Doubt Error:", error);
    return res.status(500).json({ success: false, message: "Unable to post reply." });
  }
};

module.exports = {
  createDoubt,
  getCourseDoubts,
  getMyDoubts,
  getFacultyDoubts,
  replyToDoubt,
};
