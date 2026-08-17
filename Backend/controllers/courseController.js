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
    } = req.body;

    const existingCourse = await Course.findOne({ courseCode });

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
      faculty: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      data: course,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Get All Courses
// ==========================
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate(
      "faculty",
      "fullName email"
    );

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
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