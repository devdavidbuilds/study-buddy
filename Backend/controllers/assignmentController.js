const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const recordActivity = require("../utils/recordActivity");

const sanitizeAssignment = (assignment) => ({
  ...assignment,
  questions: (assignment.questions || []).map(({ correctAnswer, ...question }) => question),
});

const canManageCourse = (course, user) =>
  user.role === "admin" || String(course.faculty) === String(user._id);

// ==============================
// Create Assignment
// ==============================
const createAssignment = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const {
      title,
      instructions,
      courseId,
      moduleId,
      lessonId,
      questions,
      totalMarks,
      dueDate,
      resources,
      status,
    } = req.body;

    // Validate required fields
    if (!title || !courseId || !moduleId || !lessonId) {
      return res.status(400).json({
        success: false,
        message: "title, courseId, moduleId, and lessonId are required.",
      });
    }

    // Validate course exists and belongs to this faculty
    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    if (String(course.faculty) !== String(facultyId)) {
      return res.status(403).json({
        success: false,
        message: "You can only create assignments for your own courses.",
      });
    }

    // Validate module and lesson exist in the course
    const mod = (course.modules || []).find((m) => m.id === moduleId);
    if (!mod) {
      return res.status(400).json({
        success: false,
        message: "Module not found in this course.",
      });
    }

    const lesson = (mod.lessons || []).find((l) => l.id === lessonId);
    if (!lesson) {
      return res.status(400).json({
        success: false,
        message: "Lesson not found in this module.",
      });
    }

    const assignment = await Assignment.create({
      title,
      instructions: instructions || "",
      course: courseId,
      moduleId,
      lessonId,
      faculty: facultyId,
      questions: questions || [],
      totalMarks: totalMarks || 10,
      dueDate: dueDate || null,
      resources: resources || [],
      status: status || "Published",
    });

    res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      data: assignment,
    });
  } catch (error) {
    console.error("Create Assignment Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Assignments for a Course
// ==============================
const getAssignmentsByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (req.user.role !== "student" && !canManageCourse(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only view assignments for your own courses.",
      });
    }

    const assignments = await Assignment.find({
      course: courseId,
      ...(req.user.role === "student" ? { status: "Published" } : {}),
    })
      .populate("faculty", "fullName email")
      .sort({ createdAt: -1 })
      .lean();
    const data = req.user.role === "student"
      ? assignments.map(sanitizeAssignment)
      : assignments;

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get Assignments Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Assignments by Faculty
// ==============================
const getMyAssignments = async (req, res) => {
  try {
    const facultyId = req.user._id;

    const assignments = await Assignment.find({ faculty: facultyId })
      .populate("course", "courseName courseCode")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: assignments.length,
      data: assignments,
    });
  } catch (error) {
    console.error("Get My Assignments Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Assignments for a specific Module/Lesson
// (used by the student assignment flow)
// ==============================
const getAssignmentsForLesson = async (req, res) => {
  try {
    const { courseId, moduleId, lessonId } = req.params;
    const course = await Course.findById(courseId).lean();

    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found." });
    }

    if (req.user.role !== "student" && !canManageCourse(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only view assignments for your own courses.",
      });
    }

    const assignments = await Assignment.find({
      course: courseId,
      moduleId,
      lessonId,
      ...(req.user.role === "student" ? { status: "Published" } : {}),
    })
      .populate("faculty", "fullName email")
      .sort({ createdAt: -1 })
      .lean();
    const data = req.user.role === "student"
      ? assignments.map(sanitizeAssignment)
      : assignments;

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Get Assignments For Lesson Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Get Student Submissions for an Assignment
// (Faculty evaluation flow — Prompt 6)
// GET /api/assignments/:assignmentId/submissions
// ==============================
const getSubmissionsForAssignment = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { assignmentId } = req.params;

    // Load the assignment together with its course, so we can confirm
    // the assignment's course actually belongs to the requesting faculty.
    const assignment = await Assignment.findById(assignmentId).lean();

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const course = await Course.findById(assignment.course).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // SECURITY: faculty may only view submissions for assignments that
    // belong to courses they own. The faculty identity is taken from the
    // authenticated JWT user (req.user), never from client input.
    if (String(course.faculty) !== String(facultyId)) {
      return res.status(403).json({
        success: false,
        message: "You can only view submissions for your own courses.",
      });
    }

    // Submissions live inside each student's CourseProgress document, in
    // the `assignments` sub-array. Find every progress document (for this
    // course) that contains an entry for this assignment.
    const progressDocs = await CourseProgress.find({
      course: assignment.course,
      "assignments.assignmentId": assignmentId,
    })
      .populate("user", "fullName email")
      .lean();

    const submissions = [];

    for (const progress of progressDocs) {
      const entry = (progress.assignments || []).find(
        (a) => String(a.assignmentId) === String(assignmentId)
      );

      if (!entry) continue;

      // Only real submissions — never fabricate rows for students who
      // haven't submitted anything yet.
      if (entry.status !== "Submitted" && entry.status !== "Evaluated") {
        continue;
      }

      submissions.push({
        studentId: progress.user?._id || null,
        studentName: progress.user?.fullName || "Unknown Student",
        studentEmail: progress.user?.email || "",
        assignmentId: assignment._id,
        assignmentTitle: assignment.title,
        courseId: course._id,
        courseName: course.courseName,
        courseCode: course.courseCode,
        moduleId: entry.moduleId,
        lessonId: entry.lessonId,
        answer: entry.answer || "",
        answers: entry.answers || [],
        questions: assignment.questions || [],
        status: entry.status,
        marks: entry.marks,
        maxMarks: entry.maxMarks || assignment.totalMarks || 0,
        feedback: entry.feedback || "",
        submittedAt: entry.submittedAt,
        evaluatedAt: entry.evaluatedAt,
      });
    }

    // Most recently submitted first
    submissions.sort(
      (a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)
    );

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: {
        assignment: {
          _id: assignment._id,
          title: assignment.title,
          totalMarks: assignment.totalMarks,
          dueDate: assignment.dueDate,
          course: {
            _id: course._id,
            courseName: course.courseName,
            courseCode: course.courseCode,
          },
        },
        submissions,
      },
    });
  } catch (error) {
    console.error("Get Submissions Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ==============================
// Evaluate a Student's Submission
// (Faculty evaluation flow — Prompt 6)
// PUT /api/assignments/:assignmentId/submissions/:studentId/evaluate
// ==============================
const evaluateSubmission = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { assignmentId, studentId } = req.params;
    const { marks, feedback } = req.body;

    if (marks === undefined || marks === null || marks === "") {
      return res.status(400).json({
        success: false,
        message: "Marks are required.",
      });
    }

    const numericMarks = Number(marks);

    if (Number.isNaN(numericMarks)) {
      return res.status(400).json({
        success: false,
        message: "Marks must be a number.",
      });
    }

    // Load assignment + course to verify ownership.
    const assignment = await Assignment.findById(assignmentId).lean();

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    const course = await Course.findById(assignment.course).lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // SECURITY: faculty identity comes only from the verified JWT user,
    // and can only evaluate submissions belonging to their own courses.
    if (String(course.faculty) !== String(facultyId)) {
      return res.status(403).json({
        success: false,
        message: "You can only evaluate submissions for your own courses.",
      });
    }

    const maxMarks = assignment.totalMarks || 0;

    if (numericMarks < 0 || numericMarks > maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${maxMarks}.`,
      });
    }

    // Locate the student's progress document for this course.
    const progress = await CourseProgress.findOne({
      user: studentId,
      course: assignment.course,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "No submission found for this student.",
      });
    }

    const entryIndex = progress.assignments.findIndex(
      (a) => String(a.assignmentId) === String(assignmentId)
    );

    if (entryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "No submission found for this student on this assignment.",
      });
    }

    const entry = progress.assignments[entryIndex];

    if (entry.status !== "Submitted" && entry.status !== "Evaluated") {
      return res.status(400).json({
        success: false,
        message: "This assignment has not been submitted yet.",
      });
    }

    entry.marks = numericMarks;
    entry.maxMarks = maxMarks;
    entry.feedback = (feedback || "").trim();
    entry.status = "Evaluated";
    entry.evaluatedAt = new Date();

    await progress.save();

    // This activity belongs to the STUDENT whose work was graded, not the
    // faculty member performing the grading — studentId here comes from
    // the route param, already verified above to have an existing
    // submission tied to it, and is only ever used as the activity owner.
    recordActivity({
      studentId,
      activityType: "ASSIGNMENT_EVALUATED",
      courseId: assignment.course,
      moduleId: entry.moduleId,
      lessonId: entry.lessonId,
      assignmentId: assignment._id,
      metadata: {
        courseName: course.courseName,
        title: assignment.title,
        marks: entry.marks,
        maxMarks: entry.maxMarks,
      },
    });

    res.status(200).json({
      success: true,
      message: "Evaluation saved successfully.",
      data: {
        studentId,
        assignmentId,
        marks: entry.marks,
        maxMarks: entry.maxMarks,
        feedback: entry.feedback,
        status: entry.status,
        evaluatedAt: entry.evaluatedAt,
      },
    });
  } catch (error) {
    console.error("Evaluate Submission Error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAssignment,
  getAssignmentsByCourse,
  getMyAssignments,
  getAssignmentsForLesson,
  getSubmissionsForAssignment,
  evaluateSubmission,
};
