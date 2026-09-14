const Course = require("../models/Course");

// ==========================
// Create Course
// ==========================
const createCourse = async (req, res) => {
  try {
    const {
      courseName,
      courseCode,
      department,
      semester,
      description,
      thumbnail,
      category,
      level,
      duration,
      color,
      skills,
      outcomes,
      modules,
      rating,
      students,
      reviewsCount,
      certificate,
    } = req.body;

    // Check required fields
    if (!courseName || !courseCode || !department || !semester) {
      return res.status(400).json({
        success: false,
        message:
          "Course name, course code, department and semester are required.",
      });
    }

    // Check duplicate course code
    const existingCourse = await Course.findOne({
      courseCode: courseCode.toUpperCase(),
    });

    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: "Course code already exists",
      });
    }

    const course = await Course.create({
      courseName,
      courseCode,
      department,
      semester,
      description,
      thumbnail,
      category,
      level,
      duration,
      color,
      skills,
      outcomes,
      modules,
      rating,
      students,
      reviewsCount,
      certificate,
      faculty: req.user._id,
    });

    // Return the populated faculty information
    const populatedCourse = await Course.findById(course._id).populate(
      "faculty",
      "fullName email"
    );

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: populatedCourse,
    });
  } catch (error) {
    console.error("Create Course Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get All Courses (Paginated)
// ==========================
const getAllCourses = async (req, res) => {
  try {
    // Parse pagination query params with safe defaults
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    // Run count and paginated query in parallel for performance
    const [total, courses] = await Promise.all([
      Course.countDocuments(),
      Course.find()
        .populate("faculty", "fullName email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
      page,
      limit,
      total,
      totalPages,
    });
  } catch (error) {
    console.error("Get Courses Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get Course By ID
// ==========================
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate(
      "faculty",
      "fullName email"
    );

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    res.status(200).json({
      success: true,
      data: course,
    });
  } catch (error) {
    console.error("Get Course Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
};