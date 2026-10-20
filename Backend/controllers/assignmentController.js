const Assignment = require("../models/Assignment");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const User = require("../models/User");
const recordActivity = require("../utils/recordActivity");

const sanitizeAssignment = (assignment) => ({
  ...assignment,
  questions: (assignment.questions || []).map(({ correctAnswer, ...question }) => question),
});

const canManageCourse = (course, user) =>
  user.role === "admin" || String(course.faculty) === String(user._id);

// Submission entries faculty can see/evaluate, and the outcomes they can set.
const SUBMITTED_STATUSES = ["Submitted", "Evaluated", "Returned"];
const EVALUATION_STATUSES = ["Evaluated", "Returned"];
const MAX_FEEDBACK_LENGTH = 5000;
const MAX_ALLOWED_MAX_MARKS = 1000;

// fullName for each evaluator id found in the given submission entries.
const loadEvaluatorNames = async (entries) => {
  const ids = [...new Set(entries.map((e) => e.evaluatedBy).filter(Boolean).map(String))];
  if (!ids.length) return new Map();
  const users = await User.find({ _id: { $in: ids } }).select("fullName").lean();
  return new Map(users.map((u) => [String(u._id), u.fullName]));
};

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
// Get All Submissions for Faculty's Courses
// GET /api/assignments/faculty/submissions
// ==============================
const getFacultySubmissions = async (req, res) => {
  try {
    const user = req.user;
    const facultyId = user._id;
    const { courseId, assignmentId, status, search } = req.query;

    // Load courses owned by this faculty (or all courses if admin)
    const courseQuery = user.role === "admin" ? {} : { faculty: facultyId };
    if (courseId) {
      courseQuery._id = courseId;
    }

    const courses = await Course.find(courseQuery)
      .select("_id courseName courseCode faculty")
      .lean();

    if (!courses.length) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const courseIds = courses.map((c) => c._id);
    const courseMap = new Map(courses.map((c) => [String(c._id), c]));

    // Query CourseProgress for these courses with submitted/evaluated assignments
    const progressDocs = await CourseProgress.find({
      course: { $in: courseIds },
      "assignments.status": { $in: SUBMITTED_STATUSES },
    })
      .populate("user", "fullName email")
      .lean();
    const evaluatorNames = await loadEvaluatorNames(progressDocs.flatMap((p) => p.assignments || []));

    // Fetch assignments for these courses to attach metadata/deadline
    const assignmentDocs = await Assignment.find({
      course: { $in: courseIds },
    }).lean();

    const assignmentById = new Map(
      assignmentDocs.map((a) => [String(a._id), a])
    );

    const submissions = [];

    for (const progress of progressDocs) {
      const course = courseMap.get(String(progress.course));
      if (!course) continue;

      for (const entry of progress.assignments || []) {
        if (!SUBMITTED_STATUSES.includes(entry.status)) {
          continue;
        }

        // Filter by assignmentId if specified in query
        if (assignmentId && String(entry.assignmentId) !== String(assignmentId)) {
          continue;
        }

        // Link assignment
        let linkedAssignment = entry.assignmentId
          ? assignmentById.get(String(entry.assignmentId))
          : null;

        if (!linkedAssignment) {
          linkedAssignment = assignmentDocs.find(
            (a) =>
              String(a.course) === String(progress.course) &&
              a.moduleId === entry.moduleId &&
              a.lessonId === entry.lessonId
          );
        }

        const dueDate = linkedAssignment?.dueDate || null;
        const submittedAt = entry.submittedAt;
        const isLate = Boolean(
          dueDate && submittedAt && new Date(submittedAt) > new Date(dueDate)
        );

        // Status filter: "all", "pending" / "pending evaluation", "evaluated", "late"
        if (status) {
          const s = String(status).toLowerCase();
          if (s === "pending" || s === "pending evaluation") {
            if (entry.status !== "Submitted") continue;
          } else if (s === "evaluated") {
            if (entry.status !== "Evaluated") continue;
          } else if (s === "returned") {
            if (entry.status !== "Returned") continue;
          } else if (s === "late") {
            if (!isLate) continue;
          }
        }

        const assignmentTitle =
          linkedAssignment?.title || entry.title || "Lesson Assignment";
        const studentName = progress.user?.fullName || "Unknown Student";
        const studentEmail = progress.user?.email || "";
        const fileName = entry.file?.originalName || "";

        if (search) {
          const term = String(search).toLowerCase();
          const match =
            studentName.toLowerCase().includes(term) ||
            studentEmail.toLowerCase().includes(term) ||
            assignmentTitle.toLowerCase().includes(term) ||
            course.courseName.toLowerCase().includes(term) ||
            course.courseCode.toLowerCase().includes(term) ||
            fileName.toLowerCase().includes(term);
          if (!match) continue;
        }

        submissions.push({
          submissionId: `${progress._id}-${entry.assignmentId || `${entry.moduleId}-${entry.lessonId}`}`,
          studentId: progress.user?._id || null,
          studentName,
          studentEmail,
          courseId: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          assignmentId: entry.assignmentId || linkedAssignment?._id || null,
          assignmentTitle,
          moduleId: entry.moduleId,
          lessonId: entry.lessonId,
          answer: entry.answer || "",
          answers: entry.answers || [],
          questions: linkedAssignment?.questions || [],
          status: entry.status,
          marks: entry.marks,
          maxMarks: entry.maxMarks || linkedAssignment?.totalMarks || 10,
          feedback: entry.feedback || "",
          submittedAt: entry.submittedAt,
          evaluatedAt: entry.evaluatedAt,
          evaluatedByName: entry.evaluatedBy ? evaluatorNames.get(String(entry.evaluatedBy)) || "" : "",
          dueDate,
          isLate,
          file: entry.file || null,
        });
      }
    }

    submissions.sort(
      (a, b) => new Date(b.submittedAt || 0) - new Date(a.submittedAt || 0)
    );

    res.status(200).json({
      success: true,
      count: submissions.length,
      data: submissions,
    });
  } catch (error) {
    console.error("Get Faculty Submissions Error:", error);
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
    // belong to courses they own.
    if (!canManageCourse(course, req.user)) {
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
      $or: [
        { "assignments.assignmentId": assignmentId },
        {
          "assignments.moduleId": assignment.moduleId,
          "assignments.lessonId": assignment.lessonId,
        },
      ],
    })
      .populate("user", "fullName email")
      .lean();
    const evaluatorNames = await loadEvaluatorNames(progressDocs.flatMap((p) => p.assignments || []));

    const submissions = [];

    for (const progress of progressDocs) {
      const entry = (progress.assignments || []).find(
        (a) =>
          String(a.assignmentId) === String(assignmentId) ||
          (!a.assignmentId &&
            a.moduleId === assignment.moduleId &&
            a.lessonId === assignment.lessonId)
      );

      if (!entry) continue;

      if (!SUBMITTED_STATUSES.includes(entry.status)) {
        continue;
      }

      const dueDate = assignment.dueDate || null;
      const isLate = Boolean(
        dueDate && entry.submittedAt && new Date(entry.submittedAt) > new Date(dueDate)
      );

      submissions.push({
        submissionId: `${progress._id}-${entry.assignmentId || `${entry.moduleId}-${entry.lessonId}`}`,
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
        evaluatedByName: entry.evaluatedBy ? evaluatorNames.get(String(entry.evaluatedBy)) || "" : "",
        dueDate,
        isLate,
        file: entry.file || null,
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
// (Faculty evaluation flow)
// PUT /api/assignments/:assignmentId/submissions/:studentId/evaluate
// OR PUT /api/assignments/submissions/:studentId/evaluate
// ==============================
const evaluateSubmission = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { studentId } = req.params;
    const assignmentId = req.params.assignmentId || req.body.assignmentId || null;
    const { marks, feedback, courseId, moduleId, lessonId } = req.body;
    // "Evaluated" (default) grades the work; "Returned" sends it back to the
    // student for resubmission, with feedback explaining why.
    const status = req.body.status === undefined ? "Evaluated" : req.body.status;

    if (!EVALUATION_STATUSES.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Status must be one of: ${EVALUATION_STATUSES.join(", ")}.`,
      });
    }

    const feedbackText = typeof feedback === "string" ? feedback.trim() : "";
    if (feedback !== undefined && feedback !== null && typeof feedback !== "string") {
      return res.status(400).json({ success: false, message: "Feedback must be text." });
    }
    if (feedbackText.length > MAX_FEEDBACK_LENGTH) {
      return res.status(400).json({
        success: false,
        message: `Feedback cannot exceed ${MAX_FEEDBACK_LENGTH} characters.`,
      });
    }
    if (status === "Returned" && !feedbackText) {
      return res.status(400).json({
        success: false,
        message: "Add feedback explaining what the student should change before returning the submission.",
      });
    }

    const marksGiven = !(marks === undefined || marks === null || marks === "");
    if (status === "Evaluated" && !marksGiven) {
      return res.status(400).json({
        success: false,
        message: "Marks are required.",
      });
    }

    const numericMarks = marksGiven ? Number(marks) : 0;

    if (typeof marks === "boolean" || !Number.isFinite(numericMarks)) {
      return res.status(400).json({
        success: false,
        message: "Marks must be a number.",
      });
    }

    if (Math.round(numericMarks * 100) !== numericMarks * 100) {
      return res.status(400).json({
        success: false,
        message: "Marks can have at most 2 decimal places.",
      });
    }

    let requestedMaxMarks = null;
    if (req.body.maxMarks !== undefined && req.body.maxMarks !== null && req.body.maxMarks !== "") {
      requestedMaxMarks = Number(req.body.maxMarks);
      if (
        typeof req.body.maxMarks === "boolean" ||
        !Number.isFinite(requestedMaxMarks) ||
        requestedMaxMarks <= 0 ||
        requestedMaxMarks > MAX_ALLOWED_MAX_MARKS
      ) {
        return res.status(400).json({
          success: false,
          message: `Maximum marks must be a number greater than 0 and at most ${MAX_ALLOWED_MAX_MARKS}.`,
        });
      }
    }

    let course = null;
    let assignment = null;

    if (assignmentId && assignmentId !== "general") {
      assignment = await Assignment.findById(assignmentId).lean();
      if (assignment) {
        course = await Course.findById(assignment.course).lean();
      }
    }

    if (!course && courseId) {
      course = await Course.findById(courseId).lean();
    }

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    // SECURITY: faculty identity comes only from the verified JWT user,
    // and can only evaluate submissions belonging to their own courses.
    if (!canManageCourse(course, req.user)) {
      return res.status(403).json({
        success: false,
        message: "You can only evaluate submissions for your own courses.",
      });
    }

    // Locate the student's progress document for this course.
    const progress = await CourseProgress.findOne({
      user: studentId,
      course: course._id,
    });

    if (!progress) {
      return res.status(404).json({
        success: false,
        message: "No submission found for this student in this course.",
      });
    }

    // Find the assignment entry
    let entryIndex = -1;
    if (assignment) {
      entryIndex = progress.assignments.findIndex(
        (a) => String(a.assignmentId) === String(assignment._id)
      );
      if (entryIndex === -1 && assignment.moduleId && assignment.lessonId) {
        entryIndex = progress.assignments.findIndex(
          (a) =>
            !a.assignmentId &&
            a.moduleId === assignment.moduleId &&
            a.lessonId === assignment.lessonId
        );
        if (entryIndex !== -1) {
          progress.assignments[entryIndex].assignmentId = assignment._id;
        }
      }
    }

    if (entryIndex === -1 && moduleId && lessonId) {
      entryIndex = progress.assignments.findIndex(
        (a) => a.moduleId === moduleId && a.lessonId === lessonId
      );
    }

    if (entryIndex === -1 && assignmentId) {
      entryIndex = progress.assignments.findIndex(
        (a) => String(a.assignmentId) === String(assignmentId)
      );
    }

    if (entryIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "No submission found for this student on this assignment.",
      });
    }

    const entry = progress.assignments[entryIndex];

    if (!SUBMITTED_STATUSES.includes(entry.status)) {
      return res.status(400).json({
        success: false,
        message: "This assignment has not been submitted yet.",
      });
    }

    // Faculty may set the maximum for this submission; otherwise keep the
    // assignment's total (or what the submission already had).
    const maxMarks = requestedMaxMarks || assignment?.totalMarks || entry.maxMarks || 10;

    if (numericMarks < 0 || numericMarks > maxMarks) {
      return res.status(400).json({
        success: false,
        message: `Marks must be between 0 and ${maxMarks}.`,
      });
    }

    // Re-evaluating updates this same entry in place — never a new record.
    entry.marks = numericMarks;
    entry.maxMarks = maxMarks;
    entry.feedback = feedbackText;
    entry.status = status;
    entry.evaluatedAt = new Date();
    entry.evaluatedBy = req.user._id;

    await progress.save();

    // This activity belongs to the STUDENT whose work was graded.
    recordActivity({
      studentId,
      activityType: "ASSIGNMENT_EVALUATED",
      courseId: course._id,
      moduleId: entry.moduleId,
      lessonId: entry.lessonId,
      assignmentId: entry.assignmentId || assignment?._id || null,
      metadata: {
        courseName: course.courseName,
        title: entry.title || assignment?.title || "Assignment",
        marks: entry.marks,
        maxMarks: entry.maxMarks,
        status: entry.status,
      },
    });

    res.status(200).json({
      success: true,
      message: status === "Returned" ? "Submission returned to the student for resubmission." : "Evaluation saved successfully.",
      data: {
        studentId,
        assignmentId: entry.assignmentId || assignment?._id || null,
        moduleId: entry.moduleId,
        lessonId: entry.lessonId,
        marks: entry.marks,
        maxMarks: entry.maxMarks,
        feedback: entry.feedback,
        status: entry.status,
        evaluatedAt: entry.evaluatedAt,
        evaluatedBy: req.user._id,
        evaluatedByName: req.user.fullName || "",
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
  getFacultySubmissions,
  getSubmissionsForAssignment,
  evaluateSubmission,
};
