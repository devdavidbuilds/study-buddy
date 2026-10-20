const validator = require("validator");
const Course = require("../models/Course");
const User = require("../models/User");

// Answer keys and their explanations are only revealed by the server-side
// lesson check (progressController.submitLessonCheck).
const sanitizeCourse = (course) => {
  const value = course?.toObject ? course.toObject() : { ...course };
  value.modules = (value.modules || []).map((module) => ({
    ...module,
    lessons: (module.lessons || []).map(({ quiz, ...lesson }) => ({
      ...lesson,
      ...(quiz?.length ? { quiz: quiz.map(({ answer, explanation, ...question }) => question) } : {}),
    })),
  }));
  return value;
};

// Catalog/list views only need course metadata and lesson outlines.
// Structured lesson bodies can be ~10 KB each, so they are left out of
// list responses and only loaded by GET /api/courses/:id.
const LIST_EXCLUDED_FIELDS =
  "-modules.lessons.learning -modules.lessons.content -modules.lessons.quiz -modules.lessons.resources";

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
    // Parse pagination query params with safe defaults.
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const maxLimit = req.query.faculty ? 500 : 100;
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filters = {};
    if (req.query.faculty) {
      filters.faculty = req.query.faculty;
    }
    const search = String(req.query.search || "").trim();
    const category = String(req.query.category || "").trim();
    const level = String(req.query.level || "").trim();

    if (search) {
      const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const searchRegex = new RegExp(escapedSearch, "i");
      const matchingFaculty = await User.find({ fullName: searchRegex }).select("_id");

      filters.$or = [
        { courseName: searchRegex },
        { courseCode: searchRegex },
        { category: searchRegex },
        { department: searchRegex },
        { faculty: { $in: matchingFaculty.map((faculty) => faculty._id) } },
      ];
    }

    if (level && level !== "All Levels") {
      filters.level = level;
    }

    if (category && category !== "All") {
      const categoryPatterns = {
        Programming: ["program", "development", "software", "web", "code", "computer"],
        "Data Science": ["data", "machine", "statistics", "analytics"],
        Design: ["design", "graphic", "ui", "ux"],
        Productivity: ["productivity", "office", "business"],
      };
      const terms = categoryPatterns[category] || [category];
      filters.category = { $in: terms.map((term) => new RegExp(term, "i")) };
    }

    const sort = req.query.sort === "rating"
      ? { rating: -1, createdAt: -1 }
      : req.query.sort === "students"
      ? { students: -1, createdAt: -1 }
      : { createdAt: -1 };

    // Run count and paginated query in parallel for performance
    const [total, courses] = await Promise.all([
      Course.countDocuments(filters),
      Course.find(filters)
        .select(LIST_EXCLUDED_FIELDS)
        .populate("faculty", "fullName email")
        .sort(sort)
        .skip(skip)
        .limit(limit),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses.map(sanitizeCourse),
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
      data: sanitizeCourse(course),
    });
  } catch (error) {
    console.error("Get Course Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==========================
// Update Course
// PUT /api/courses/:id
//
// Body (either part optional, at least one required):
//   {
//     course: { courseName, description, category, level, duration, thumbnail, color, skills, outcomes },
//     moduleId, lessonId,
//     lesson: { title, duration, description, content, videoUrl, resources }
//   }
//
// Lessons are updated in place (positional array filters), so lesson ids,
// quiz answer keys, structured content and all student progress keyed by
// module/lesson id are never replaced. Only the course's own faculty (or
// an admin) may update it; unknown fields are ignored.
// ==========================
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

const isHttpUrl = (value) => validator.isURL(value, { protocols: ["http", "https"], require_protocol: true });

const validateCourseFields = (input) => {
  const set = {};
  const errors = [];
  const str = (field, { min = 0, max }) => {
    if (input[field] === undefined) return;
    if (typeof input[field] !== "string") return errors.push(`${field} must be text.`);
    const value = input[field].trim();
    if (value.length < min || value.length > max) return errors.push(`${field} must be ${min}-${max} characters.`);
    set[field] = value;
  };
  const list = (field, maxItems, maxLength) => {
    if (input[field] === undefined) return;
    if (!Array.isArray(input[field]) || input[field].some((item) => typeof item !== "string")) {
      return errors.push(`${field} must be a list of text items.`);
    }
    const items = input[field].map((item) => item.trim()).filter(Boolean);
    if (items.length > maxItems || items.some((item) => item.length > maxLength)) {
      return errors.push(`${field} allows up to ${maxItems} items of ${maxLength} characters.`);
    }
    set[field] = items;
  };

  str("courseName", { min: 3, max: 100 });
  str("description", { max: 500 });
  str("category", { min: 1, max: 60 });
  str("duration", { max: 30 });
  str("thumbnail", { max: 500 });
  str("color", { max: 30 });
  list("skills", 30, 100);
  list("outcomes", 20, 300);
  if (input.level !== undefined) {
    if (!LEVELS.includes(input.level)) errors.push(`level must be one of ${LEVELS.join(", ")}.`);
    else set.level = input.level;
  }
  return { set, errors };
};

const validateLessonFields = (input) => {
  const set = {};
  const errors = [];
  const str = (field, { min = 0, max }) => {
    if (input[field] === undefined) return;
    if (typeof input[field] !== "string") return errors.push(`Lesson ${field} must be text.`);
    const value = field === "content" ? input[field].replace(/\s+$/, "") : input[field].trim();
    if (value.length < min || value.length > max) return errors.push(`Lesson ${field} must be ${min}-${max} characters.`);
    set[field] = value;
  };

  str("title", { min: 1, max: 200 });
  str("duration", { max: 30 });
  str("description", { max: 2000 });
  str("content", { max: 50000 });
  if (input.videoUrl !== undefined) {
    const url = typeof input.videoUrl === "string" ? input.videoUrl.trim() : null;
    if (url === null || (url && (url.length > 500 || !isHttpUrl(url)))) errors.push("Video URL must be a valid http(s) link or empty.");
    else set.videoUrl = url;
  }
  if (input.resources !== undefined) {
    if (!Array.isArray(input.resources) || input.resources.some((r) => typeof r !== "string")) {
      errors.push("Resources must be a list of text items.");
    } else {
      const resources = input.resources.map((r) => r.trim()).filter(Boolean);
      if (resources.length > 20 || resources.some((r) => r.length > 500)) errors.push("Up to 20 resources of 500 characters each.");
      else set.resources = resources;
    }
  }
  return { set, errors };
};

const updateCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // SECURITY: ownership comes from the verified JWT user, never the body.
    if (req.user.role !== "admin" && String(course.faculty) !== String(req.user._id)) {
      return res.status(403).json({ success: false, message: "You can only edit your own courses." });
    }

    const { course: courseInput, moduleId, lessonId, lesson: lessonInput } = req.body || {};
    if (!courseInput && !lessonInput) {
      return res.status(400).json({ success: false, message: "Nothing to update. Send `course` and/or `lesson` fields." });
    }

    const $set = {};
    const errors = [];
    const options = { runValidators: true };

    if (courseInput) {
      if (typeof courseInput !== "object" || Array.isArray(courseInput)) {
        return res.status(400).json({ success: false, message: "`course` must be an object." });
      }
      const result = validateCourseFields(courseInput);
      errors.push(...result.errors);
      Object.assign($set, result.set);
    }

    if (lessonInput) {
      if (typeof lessonInput !== "object" || Array.isArray(lessonInput)) {
        return res.status(400).json({ success: false, message: "`lesson` must be an object." });
      }
      if (!moduleId || !lessonId) {
        return res.status(400).json({ success: false, message: "moduleId and lessonId are required to update a lesson." });
      }
      const module = (course.modules || []).find((m) => m.id === moduleId);
      const lesson = module?.lessons?.find((l) => l.id === lessonId);
      if (!lesson) {
        return res.status(404).json({ success: false, message: "Lesson not found in this course." });
      }

      const result = validateLessonFields(lessonInput);
      errors.push(...result.errors);
      for (const [field, value] of Object.entries(result.set)) {
        $set[`modules.$[m].lessons.$[l].${field}`] = value;
      }
      // Structured lessons read their explanation from learning.explanation;
      // keep it in sync with the edited reading material.
      if (result.set.content !== undefined && lesson.learning) {
        $set["modules.$[m].lessons.$[l].learning.explanation"] = result.set.content;
      }
      options.arrayFilters = [{ "m.id": moduleId }, { "l.id": lessonId }];
    }

    if (errors.length) {
      return res.status(400).json({ success: false, message: errors.join(" "), errors });
    }
    if (!Object.keys($set).length) {
      return res.status(400).json({ success: false, message: "No editable fields were provided." });
    }

    await Course.updateOne({ _id: course._id }, { $set }, options);

    const updated = await Course.findById(course._id).populate("faculty", "fullName email");

    res.status(200).json({
      success: true,
      message: "Course updated successfully",
      data: sanitizeCourse(updated),
    });
  } catch (error) {
    console.error("Update Course Error:", error);

    res.status(500).json({
      success: false,
      message: "Could not update the course.",
    });
  }
};

// ==========================
// Get Logged-in Faculty's Courses
// ==========================
const getMyFacultyCourses = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const filters = req.user.role === "admin" ? {} : { faculty: facultyId };

    // Faculty pages only need course metadata plus module/lesson counts.
    // Sending the module/lesson outlines too made this response ~50 MB for
    // a faculty with thousands of courses, which exhausted memory; pages
    // that need a course's modules load that one course by id.
    const courses = await Course.aggregate([
      { $match: filters },
      {
        $addFields: {
          moduleCount: { $size: { $ifNull: ["$modules", []] } },
          lessonCount: {
            $sum: {
              $map: {
                input: { $ifNull: ["$modules", []] },
                as: "module",
                in: { $size: { $ifNull: ["$$module.lessons", []] } },
              },
            },
          },
        },
      },
      { $project: { modules: 0 } },
      { $sort: { createdAt: -1 } },
    ]).allowDiskUse(true);

    await Course.populate(courses, { path: "faculty", select: "fullName email" });

    res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } catch (error) {
    console.error("Get My Faculty Courses Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getMyFacultyCourses,
  getCourseById,
  updateCourse,
};