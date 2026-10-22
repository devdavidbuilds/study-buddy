const mongoose = require("mongoose");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");

const COURSE_FIELDS = "courseName courseCode thumbnail color category level";
const STUDENT_FIELDS = "fullName email phone rollNumber department yearOfStudy university";

// ==============================
// Student: GET /api/enrollments/mine
// ==============================
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ student: req.user._id })
      .sort({ updatedAt: -1 })
      .populate("course", COURSE_FIELDS)
      .lean();
    res.status(200).json({ success: true, data: enrollments.filter((e) => e.course) });
  } catch (error) {
    console.error("My Enrollments Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to load your enrollments." });
  }
};

// ==============================
// Student: GET /api/enrollments/course/:courseId
// Returns { status: "none" } when the student never asked.
// ==============================
const getMyEnrollmentForCourse = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({ student: req.user._id, course: req.params.courseId }).lean();
    res.status(200).json({ success: true, data: enrollment || { status: "none" } });
  } catch (error) {
    console.error("Enrollment Status Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to load your enrollment." });
  }
};

// ==============================
// Student: POST /api/enrollments/course/:courseId  { message? }
// Creates a pending request; a rejected request can be sent again.
// ==============================
const requestEnrollment = async (req, res) => {
  try {
    const course = await Course.findById(req.params.courseId).select("status").lean();
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    if (course.status === "Archived") {
      return res.status(400).json({ success: false, message: "This course is archived and not taking enrollments." });
    }

    const message = typeof req.body?.message === "string" ? req.body.message.trim().slice(0, 300) : "";
    let enrollment = await Enrollment.findOne({ student: req.user._id, course: course._id });

    if (enrollment?.status === "approved") {
      return res.status(400).json({ success: false, message: "You are already enrolled in this course." });
    }
    if (enrollment?.status === "pending") {
      return res.status(200).json({ success: true, message: "Your request is already waiting for approval.", data: enrollment });
    }

    if (enrollment) {
      // Re-request after a rejection.
      Object.assign(enrollment, { status: "pending", message, decisionNote: "", requestedAt: new Date(), decidedAt: null, decidedBy: null, source: "request" });
      await enrollment.save();
    } else {
      enrollment = await Enrollment.create({ student: req.user._id, course: course._id, message });
    }
    res.status(201).json({ success: true, message: "Enrollment requested. You can start once faculty approve it.", data: enrollment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ success: true, message: "Your request is already waiting for approval." });
    }
    console.error("Request Enrollment Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to request enrollment." });
  }
};

// ==============================
// Student: DELETE /api/enrollments/course/:courseId — cancel a pending request
// ==============================
const cancelEnrollmentRequest = async (req, res) => {
  try {
    const result = await Enrollment.deleteOne({ student: req.user._id, course: req.params.courseId, status: "pending" });
    if (!result.deletedCount) return res.status(404).json({ success: false, message: "No pending request to cancel." });
    res.status(200).json({ success: true, message: "Enrollment request cancelled." });
  } catch (error) {
    console.error("Cancel Enrollment Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to cancel the request." });
  }
};

// ==============================
// Faculty/admin: GET /api/enrollments/requests?status=pending|approved|rejected|all
// Requests for courses the faculty member owns (admin: all courses).
// ==============================
const getEnrollmentRequests = async (req, res) => {
  try {
    const status = ["pending", "approved", "rejected", "all"].includes(req.query.status) ? req.query.status : "pending";
    const scope = {};
    if (req.user.role !== "admin") {
      scope.course = { $in: (await Course.find({ faculty: req.user._id }).select("_id").lean()).map((c) => c._id) };
    }

    const [requests, counts] = await Promise.all([
      Enrollment.find({ ...scope, ...(status === "all" ? {} : { status }) })
        .sort({ status: 1, requestedAt: -1 })
        .limit(500)
        .populate("student", STUDENT_FIELDS)
        .populate("course", COURSE_FIELDS)
        .populate("decidedBy", "fullName")
        .lean(),
      Enrollment.aggregate([{ $match: scope }, { $group: { _id: "$status", n: { $sum: 1 } } }]),
    ]);

    const count = Object.fromEntries(counts.map((c) => [c._id, c.n]));
    res.status(200).json({
      success: true,
      counts: { pending: count.pending || 0, approved: count.approved || 0, rejected: count.rejected || 0 },
      data: requests.filter((r) => r.student && r.course),
    });
  } catch (error) {
    console.error("Enrollment Requests Error:", error);
    res.status(500).json({ success: false, message: "Unable to load enrollment requests." });
  }
};

// ==============================
// Faculty/admin: PUT /api/enrollments/:id/decision  { decision: "approve"|"reject", note? }
// ==============================
const decideEnrollment = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: "Invalid id." });
    }
    const decision = req.body?.decision;
    if (!["approve", "reject"].includes(decision)) {
      return res.status(400).json({ success: false, message: 'decision must be "approve" or "reject".' });
    }

    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) return res.status(404).json({ success: false, message: "Enrollment request not found." });

    const course = await Course.findById(enrollment.course).select("faculty").lean();
    if (req.user.role !== "admin" && String(course?.faculty) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "Only this course's faculty can decide this request." });
    }

    enrollment.status = decision === "approve" ? "approved" : "rejected";
    enrollment.decisionNote = typeof req.body.note === "string" ? req.body.note.trim().slice(0, 300) : "";
    enrollment.decidedAt = new Date();
    enrollment.decidedBy = req.user._id;
    await enrollment.save();

    res.status(200).json({
      success: true,
      message: decision === "approve" ? "Enrollment approved." : "Enrollment rejected.",
      data: enrollment,
    });
  } catch (error) {
    console.error("Decide Enrollment Error:", error.message);
    res.status(500).json({ success: false, message: "Unable to update the request." });
  }
};

module.exports = {
  getMyEnrollments,
  getMyEnrollmentForCourse,
  requestEnrollment,
  cancelEnrollmentRequest,
  getEnrollmentRequests,
  decideEnrollment,
};
