const mongoose = require("mongoose");
const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Certificate = require("../models/Certificate");
const StudentActivity = require("../models/StudentActivity");

// ==============================
// Faculty "Students" page: every registered student with their
// registration details, login status and learning summary.
//
// Login status comes from User.lastLoginAt / lastSeenAt (recorded at
// login and on authenticated requests) and from the student's activity log.
// ==============================

const ONLINE_MS = 5 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

const PROFILE_FIELDS =
  "fullName email phone dateOfBirth university department yearOfStudy rollNumber bio createdAt lastLoginAt lastSeenAt loginCount isActive";

const latest = (...dates) => {
  const times = dates.filter(Boolean).map((d) => new Date(d).getTime());
  return times.length ? new Date(Math.max(...times)) : null;
};

const statusFor = ({ lastSeenAt, lastActiveAt, lastLoginAt }, now) => {
  if (lastSeenAt && now - new Date(lastSeenAt) <= ONLINE_MS) return "online";
  if (!lastActiveAt && !lastLoginAt) return "never";
  if (lastActiveAt && now - lastActiveAt <= DAY_MS) return "today";
  if (lastActiveAt && now - lastActiveAt <= 7 * DAY_MS) return "week";
  return "inactive";
};

// ==============================
// GET /api/faculty/students
// ==============================
const getStudents = async (req, res) => {
  try {
    const now = Date.now();
    const students = await User.find({ role: "student" }).select(PROFILE_FIELDS).lean();
    const ids = students.map((s) => s._id);

    const [progressRows, certRows, activityRows] = await Promise.all([
      CourseProgress.aggregate([
        { $match: { user: { $in: ids } } },
        {
          $project: {
            user: 1,
            updatedAt: 1,
            lessons: { $size: { $ifNull: ["$completedLessons", []] } },
            checks: { $ifNull: ["$lessonChecks", []] },
            quizzes: { $ifNull: ["$quizAttempts", []] },
          },
        },
        {
          $group: {
            _id: "$user",
            courses: { $sum: 1 },
            lessons: { $sum: "$lessons" },
            scores: { $push: { $concatArrays: [{ $map: { input: "$checks", as: "c", in: "$$c.percentage" } }, { $map: { input: "$quizzes", as: "q", in: "$$q.percentage" } }] } },
            lastProgressAt: { $max: "$updatedAt" },
          },
        },
      ]),
      Certificate.aggregate([{ $match: { student: { $in: ids } } }, { $group: { _id: "$student", n: { $sum: 1 } } }]),
      StudentActivity.aggregate([{ $match: { student: { $in: ids } } }, { $group: { _id: "$student", last: { $max: "$createdAt" } } }]),
    ]);

    const progressBy = new Map(progressRows.map((r) => [String(r._id), r]));
    const certsBy = new Map(certRows.map((r) => [String(r._id), r.n]));
    const activityBy = new Map(activityRows.map((r) => [String(r._id), r.last]));

    const rows = students
      .map((s) => {
        const p = progressBy.get(String(s._id));
        const scores = (p?.scores || []).flat();
        const lastActiveAt = latest(s.lastSeenAt, s.lastLoginAt, activityBy.get(String(s._id)), p?.lastProgressAt);
        return {
          _id: s._id,
          fullName: s.fullName,
          email: s.email,
          phone: s.phone || "",
          university: s.university || "",
          department: s.department || "",
          yearOfStudy: s.yearOfStudy || null,
          rollNumber: s.rollNumber || "",
          joinedAt: s.createdAt,
          lastLoginAt: s.lastLoginAt,
          lastSeenAt: s.lastSeenAt,
          lastActiveAt,
          loginCount: s.loginCount || 0,
          isActive: s.isActive !== false,
          courses: p?.courses || 0,
          lessonsCompleted: p?.lessons || 0,
          certificates: certsBy.get(String(s._id)) || 0,
          averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
          status: statusFor({ lastSeenAt: s.lastSeenAt, lastActiveAt, lastLoginAt: s.lastLoginAt }, now),
        };
      })
      .sort((a, b) => (b.lastActiveAt ? new Date(b.lastActiveAt) : 0) - (a.lastActiveAt ? new Date(a.lastActiveAt) : 0));

    const count = (status) => rows.filter((r) => r.status === status).length;
    return res.status(200).json({
      success: true,
      data: {
        summary: {
          total: rows.length,
          online: count("online"),
          activeToday: count("online") + count("today"),
          activeThisWeek: count("online") + count("today") + count("week"),
          neverLoggedIn: count("never"),
        },
        students: rows,
      },
    });
  } catch (error) {
    console.error("Faculty Students Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load students." });
  }
};

// ==============================
// GET /api/faculty/students/:studentId
// ==============================
const getStudentDetail = async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.studentId)) {
      return res.status(400).json({ success: false, message: "Invalid studentId." });
    }
    const student = await User.findOne({ _id: req.params.studentId, role: "student" }).select(PROFILE_FIELDS).lean();
    if (!student) return res.status(404).json({ success: false, message: "Student not found." });

    const [progressDocs, certificates, activity] = await Promise.all([
      CourseProgress.find({ user: student._id }).select("course completedLessons lessonChecks quizAttempts updatedAt").lean(),
      Certificate.find({ student: student._id }).select("courseName certificateId issuedAt").sort({ issuedAt: -1 }).lean(),
      StudentActivity.find({ student: student._id }).sort({ createdAt: -1 }).limit(10).populate("course", "courseName").lean(),
    ]);

    const courseDocs = await Course.find({ _id: { $in: progressDocs.map((p) => p.course) } })
      .select("courseName courseCode thumbnail modules.id modules.lessons.id")
      .lean();
    const courseById = new Map(courseDocs.map((c) => [String(c._id), c]));

    const courses = progressDocs
      .map((p) => {
        const course = courseById.get(String(p.course));
        if (!course) return null;
        const keys = new Set((course.modules || []).flatMap((m) => (m.lessons || []).map((l) => `${m.id}::${l.id}`)));
        const done = new Set((p.completedLessons || []).map((l) => `${l.moduleId}::${l.lessonId}`).filter((k) => keys.has(k)));
        const scores = [...(p.lessonChecks || []), ...(p.quizAttempts || [])].map((x) => x.percentage);
        return {
          courseId: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          thumbnail: course.thumbnail,
          completedLessons: done.size,
          totalLessons: keys.size,
          percentage: keys.size ? Math.min(100, Math.round((done.size / keys.size) * 100)) : 0,
          averageScore: scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null,
          lastActivityAt: p.updatedAt,
        };
      })
      .filter(Boolean)
      .sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));

    const lastActiveAt = latest(student.lastSeenAt, student.lastLoginAt, activity[0]?.createdAt, ...progressDocs.map((p) => p.updatedAt));
    return res.status(200).json({
      success: true,
      data: {
        student: {
          ...student,
          lastActiveAt,
          status: statusFor({ lastSeenAt: student.lastSeenAt, lastActiveAt, lastLoginAt: student.lastLoginAt }, Date.now()),
        },
        courses,
        certificates,
        activity: activity.map((a) => ({
          _id: a._id,
          type: a.activityType,
          courseName: a.course?.courseName || "",
          title: a.metadata?.title || "",
          score: a.metadata?.percentage,
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Faculty Student Detail Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load this student." });
  }
};

module.exports = { getStudents, getStudentDetail };
