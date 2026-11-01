const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Enrollment = require("../models/Enrollment");
const CourseFeedback = require("../models/CourseFeedback");
const StudentActivity = require("../models/StudentActivity");
const { DOMAIN_DEFINITIONS } = require("../utils/domainHelper");

const VALID_DOMAINS = DOMAIN_DEFINITIONS.map((d) => d.id);

// ==============================
// Admin: POST /api/admin/faculty
// Create a new faculty account assigned to a domain
// ==============================
const createFaculty = async (req, res) => {
  try {
    const { fullName, email, password, domain, department, phone } = req.body;

    if (!fullName || !String(fullName).trim()) {
      return res.status(400).json({
        success: false,
        message: "Full Name is required.",
      });
    }

    if (!email || !validator.isEmail(String(email).trim())) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid email address.",
      });
    }

    if (!password || String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    if (!domain || !String(domain).trim()) {
      return res.status(400).json({
        success: false,
        message: "A domain must be assigned to the faculty member.",
      });
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: trimmedEmail });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "An account with this email address already exists.",
      });
    }

    const newFaculty = await User.create({
      fullName: String(fullName).trim(),
      email: trimmedEmail,
      password,
      role: "faculty",
      domain: String(domain).trim(),
      department: department ? String(department).trim() : "",
      phone: phone ? String(phone).trim() : "",
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: `Faculty account for ${newFaculty.fullName} created successfully in ${newFaculty.domain}.`,
      data: {
        _id: newFaculty._id,
        fullName: newFaculty.fullName,
        email: newFaculty.email,
        role: newFaculty.role,
        domain: newFaculty.domain,
        department: newFaculty.department,
        phone: newFaculty.phone,
        createdAt: newFaculty.createdAt,
      },
    });
  } catch (error) {
    console.error("Create Faculty Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create faculty account.",
    });
  }
};

// ==============================
// Admin: GET /api/admin/overview
// Comprehensive statistics for students, teachers, courses & ratings
// ==============================
const getAdminOverview = async (req, res) => {
  try {
    const [
      totalStudents,
      totalFaculty,
      totalCourses,
      totalEnrollments,
      feedbackStats,
      coursesByDomain,
      facultyByDomain,
      recentActivityDocs,
    ] = await Promise.all([
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "faculty" }),
      Course.countDocuments({ status: "Active" }),
      Enrollment.countDocuments({ status: "approved" }),
      CourseFeedback.aggregate([
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
          },
        },
      ]),
      Course.aggregate([
        { $match: { status: "Active" } },
        {
          $group: {
            _id: "$domain",
            count: { $sum: 1 },
            avgRating: { $avg: "$rating" },
            students: { $sum: "$students" },
          },
        },
      ]),
      User.aggregate([
        { $match: { role: "faculty" } },
        { $group: { _id: "$domain", count: { $sum: 1 } } },
      ]),
      StudentActivity.find()
        .sort({ createdAt: -1 })
        .limit(8)
        .populate("student", "fullName email")
        .populate("course", "courseName domain")
        .lean(),
    ]);

    const facultyMap = new Map(facultyByDomain.map((f) => [f._id || "Unassigned", f.count]));
    const courseMap = new Map(coursesByDomain.map((c) => [c._id || "Other", c]));

    const domainStats = VALID_DOMAINS.map((domainName) => {
      const c = courseMap.get(domainName) || {};
      return {
        domain: domainName,
        courses: c.count || 0,
        faculty: facultyMap.get(domainName) || 0,
        students: c.students || 0,
        avgRating: c.avgRating ? Math.round(c.avgRating * 10) / 10 : 0,
      };
    });

    const overallAvg = feedbackStats[0]?.avgRating
      ? Math.round(feedbackStats[0].avgRating * 10) / 10
      : 4.5;
    const totalReviews = feedbackStats[0]?.count || 0;

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalStudents,
          totalFaculty,
          totalCourses,
          totalEnrollments,
          averageRating: overallAvg,
          totalReviews,
        },
        domainStats,
        domains: VALID_DOMAINS,
        recentActivity: recentActivityDocs.map((a) => ({
          _id: a._id,
          activityType: a.activityType,
          studentName: a.student?.fullName || "Student",
          courseName: a.course?.courseName || "Course",
          domain: a.course?.domain || "",
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Admin Overview Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load admin overview.",
    });
  }
};

// ==============================
// Admin: GET /api/admin/faculty
// List all faculty members with assigned domain & workload metrics
// ==============================
const getFacultyList = async (req, res) => {
  try {
    const { domain, search } = req.query;
    const filter = { role: "faculty" };

    if (domain && domain !== "All") {
      filter.domain = domain;
    }

    if (search && String(search).trim()) {
      const searchRegex = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { domain: searchRegex },
      ];
    }

    const facultyMembers = await User.find(filter)
      .select("fullName email domain department phone createdAt lastLoginAt lastSeenAt isActive")
      .sort({ createdAt: -1 })
      .lean();

    const facultyIds = facultyMembers.map((f) => f._id);

    // Aggregate course counts & active student stats per faculty
    const [courseStats, coursesByFacultyDomain] = await Promise.all([
      Course.aggregate([
        { $match: { faculty: { $in: facultyIds } } },
        {
          $group: {
            _id: "$faculty",
            courseCount: { $sum: 1 },
            studentCount: { $sum: "$students" },
            avgRating: { $avg: "$rating" },
          },
        },
      ]),
      Course.aggregate([
        { $match: { status: "Active" } },
        {
          $group: {
            _id: "$domain",
            domainCourses: { $sum: 1 },
            domainStudents: { $sum: "$students" },
            domainAvgRating: { $avg: "$rating" },
          },
        },
      ]),
    ]);

    const statsMap = new Map(courseStats.map((s) => [String(s._id), s]));
    const domainMap = new Map(coursesByFacultyDomain.map((d) => [d._id, d]));

    const data = facultyMembers.map((f) => {
      const direct = statsMap.get(String(f._id));
      const domainInfo = domainMap.get(f.domain) || {};

      return {
        _id: f._id,
        fullName: f.fullName,
        email: f.email,
        domain: f.domain || "Unassigned",
        department: f.department || "",
        phone: f.phone || "",
        createdAt: f.createdAt,
        lastLoginAt: f.lastLoginAt,
        lastSeenAt: f.lastSeenAt,
        isActive: f.isActive !== false,
        // Shows direct courses or assigned domain catalog
        coursesCount: direct?.courseCount || domainInfo.domainCourses || 0,
        studentsCount: direct?.studentCount || domainInfo.domainStudents || 0,
        averageRating: direct?.avgRating
          ? Math.round(direct.avgRating * 10) / 10
          : domainInfo.domainAvgRating
          ? Math.round(domainInfo.domainAvgRating * 10) / 10
          : 4.8,
      };
    });

    return res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Admin Faculty List Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load faculty list.",
    });
  }
};

// ==============================
// Admin: GET /api/admin/students
// Student progress tracking across all domains
// ==============================
const getStudentProgressList = async (req, res) => {
  try {
    const { domain, search, page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const filter = { role: "student" };
    if (search && String(search).trim()) {
      const searchRegex = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { fullName: searchRegex },
        { email: searchRegex },
        { department: searchRegex },
        { rollNumber: searchRegex },
      ];
    }

    const [total, students] = await Promise.all([
      User.countDocuments(filter),
      User.find(filter)
        .select("fullName email department yearOfStudy rollNumber createdAt lastLoginAt lastSeenAt")
        .sort({ lastSeenAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
    ]);

    const studentIds = students.map((s) => s._id);

    // Load progress for these students
    const progressList = await CourseProgress.find({ user: { $in: studentIds } })
      .populate("course", "courseName domain")
      .lean();

    const progressByStudent = new Map();
    for (const p of progressList) {
      const uid = String(p.user);
      if (!progressByStudent.has(uid)) progressByStudent.set(uid, []);
      progressByStudent.get(uid).push(p);
    }

    const rows = students.map((s) => {
      const progs = progressByStudent.get(String(s._id)) || [];
      const coursesEnrolled = progs.length;
      const completedLessons = progs.reduce(
        (sum, p) => sum + (p.completedLessons?.length || 0),
        0
      );
      const studentDomains = [...new Set(progs.map((p) => p.course?.domain).filter(Boolean))];

      const quizScores = progs
        .flatMap((p) => p.quizAttempts || [])
        .map((q) => q.percentage)
        .filter((pct) => pct !== undefined && pct !== null);

      const quizAverage = quizScores.length
        ? Math.round(quizScores.reduce((a, b) => a + b, 0) / quizScores.length)
        : null;

      return {
        _id: s._id,
        fullName: s.fullName,
        email: s.email,
        department: s.department || "",
        yearOfStudy: s.yearOfStudy,
        rollNumber: s.rollNumber || "",
        domains: studentDomains,
        coursesEnrolled,
        completedLessons,
        quizAverage,
        lastSeenAt: s.lastSeenAt,
        lastLoginAt: s.lastLoginAt,
        joinedAt: s.createdAt,
      };
    });

    const filteredRows = domain && domain !== "All"
      ? rows.filter((r) => r.domains.includes(domain))
      : rows;

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      data: filteredRows,
    });
  } catch (error) {
    console.error("Admin Students Progress Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load student progress list.",
    });
  }
};

// ==============================
// Admin: GET /api/admin/course-ratings
// Course ratings & feedback analytics across domains
// ==============================
const getCourseRatings = async (req, res) => {
  try {
    const { domain, search, sort = "rating", page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 50));
    const skip = (pageNum - 1) * limitNum;

    const filter = { status: "Active" };
    if (domain && domain !== "All") {
      filter.domain = domain;
    }
    if (search && String(search).trim()) {
      const searchRegex = new RegExp(String(search).trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [
        { courseName: searchRegex },
        { courseCode: searchRegex },
        { domain: searchRegex },
      ];
    }

    const sortMap = {
      rating: { rating: -1, reviewsCount: -1 },
      reviews: { reviewsCount: -1, rating: -1 },
      students: { students: -1, rating: -1 },
      name: { courseName: 1 },
    };

    const [total, courses, distributionAgg, overallAgg] = await Promise.all([
      Course.countDocuments(filter),
      Course.find(filter)
        .select("courseName courseCode domain rating reviewsCount students faculty thumbnail color")
        .populate("faculty", "fullName email")
        .sort(sortMap[sort] || sortMap.rating)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      CourseFeedback.aggregate([
        {
          $group: {
            _id: "$rating",
            count: { $sum: 1 },
          },
        },
      ]),
      Course.aggregate([
        { $match: { status: "Active" } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: "$rating" },
            totalReviews: { $sum: "$reviewsCount" },
            totalStudents: { $sum: "$students" },
          },
        },
      ]),
    ]);

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distributionAgg.forEach((d) => {
      if (d._id >= 1 && d._id <= 5) distribution[d._id] = d.count;
    });

    const averageRating = overallAgg[0]?.avgRating
      ? Math.round(overallAgg[0].avgRating * 10) / 10
      : 4.8;

    return res.status(200).json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      stats: {
        averageRating,
        totalReviews: overallAgg[0]?.totalReviews || 0,
        totalStudents: overallAgg[0]?.totalStudents || 0,
        distribution,
      },
      data: courses.map((c) => ({
        _id: c._id,
        courseName: c.courseName,
        courseCode: c.courseCode,
        domain: c.domain || "General",
        rating: c.rating || 4.5,
        reviewsCount: c.reviewsCount || 0,
        students: c.students || 0,
        facultyName: c.faculty?.fullName || "Assigned Faculty",
        facultyEmail: c.faculty?.email || "",
      })),
    });
  } catch (error) {
    console.error("Admin Course Ratings Error:", error);
    return res.status(500).json({
      success: false,
      message: "Unable to load course ratings.",
    });
  }
};

module.exports = {
  createFaculty,
  getAdminOverview,
  getFacultyList,
  getStudentProgressList,
  getCourseRatings,
};
