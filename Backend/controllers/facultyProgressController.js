const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Assignment = require("../models/Assignment");
const Quiz = require("../models/Quiz");
const StudentActivity = require("../models/StudentActivity");
const User = require("../models/User");

// ==============================================================
// Faculty Student Progress + Analytics
//
// Read-only reporting endpoints. Every number returned here is
// derived from CourseProgress, StudentActivity, Assignment and Quiz
// documents that already exist for real student/faculty actions.
// Nothing is invented, hardcoded, or randomly generated.
//
// SECURITY: a faculty member may only view analytics for courses
// where course.faculty === req.user._id. That id always comes from
// the verified JWT (req.user), never from the request. This mirrors
// the ownership check already used in assignmentController.js and
// quizController.js.
// ==============================================================

// A student counts as "active" if they have any recorded activity
// for this course within this many days.
const ACTIVE_WINDOW_DAYS = 30;

// How many of the most recent activity events to return in the
// student detail view.
const RECENT_ACTIVITY_LIMIT = 20;

// How many days of daily activity counts to return for the
// "activity over time" chart.
const ACTIVITY_TIMELINE_DAYS = 14;

// ==============================
// Helper: count total lessons defined in a course's modules.
// (Same logic as progressController.countTotalLessons — duplicated
// locally to avoid modifying that file for an unrelated feature.)
// ==============================
const countTotalLessons = (course) => {
  if (!Array.isArray(course?.modules)) return 0;
  return course.modules.reduce((total, mod) => {
    return total + (Array.isArray(mod?.lessons) ? mod.lessons.length : 0);
  }, 0);
};

// ==============================
// Helper: build a flat { "moduleId::lessonId": lessonTitle } lookup
// from a course's modules, so we can attach human-readable titles to
// completed-lesson records without re-querying per student.
// ==============================
const buildLessonTitleMap = (course) => {
  const map = new Map();
  (course?.modules || []).forEach((mod) => {
    (mod?.lessons || []).forEach((lesson) => {
      map.set(`${mod.id}::${lesson.id}`, lesson.title || "");
    });
  });
  return map;
};

// ==============================
// Helper: verify the requesting faculty owns this course.
// Returns the course (lean) on success, or null and writes the
// appropriate error response itself.
// ==============================
const loadOwnedCourse = async (req, res) => {
  const { courseId } = req.params;

  const course = await Course.findById(courseId).lean();

  if (!course) {
    res.status(404).json({ success: false, message: "Course not found." });
    return null;
  }

  // SECURITY: ownership is resolved only from the authenticated JWT
  // user — never trust a facultyId supplied by the client.
  if (String(course.faculty) !== String(req.user._id)) {
    res.status(403).json({
      success: false,
      message: "You can only view analytics for your own courses.",
    });
    return null;
  }

  return course;
};

// ==============================
// Helper: a simple, factual status label derived purely from the
// completion percentage — no invented categories.
// ==============================
const deriveStatus = (percentage, hasAnyRecord) => {
  if (!hasAnyRecord) return "Not Started";
  if (percentage >= 100) return "Completed";
  if (percentage > 0) return "In Progress";
  return "Not Started";
};

// ================================================================
// GET /api/faculty/courses/:courseId/progress
//
// Course-level analytics + the student list, in one call so the
// frontend's "Student Progress" screen only needs one request.
// ================================================================
const getCourseProgressOverview = async (req, res) => {
  try {
    const course = await loadOwnedCourse(req, res);
    if (!course) return; // response already sent

    const totalLessons = countTotalLessons(course);

    const [progressDocs, assignments, quizzes, activities] = await Promise.all([
      CourseProgress.find({ course: course._id })
        .populate("user", "fullName email")
        .lean(),
      Assignment.find({ course: course._id }).lean(),
      Quiz.find({ course: course._id }).lean(),
      StudentActivity.find({ course: course._id }).lean(),
    ]);

    // ── Build a per-student aggregate, seeded from CourseProgress
    //    docs, then filled in / extended with StudentActivity so a
    //    student who has only opened the course (no completions or
    //    submissions yet) still shows up. ──
    const studentMap = new Map(); // studentId -> aggregate

    const ensureStudent = (studentId, userInfo) => {
      const key = String(studentId);
      if (!studentMap.has(key)) {
        studentMap.set(key, {
          studentId: key,
          name: userInfo?.fullName || "Unknown Student",
          email: userInfo?.email || "",
          completedLessonsCount: 0,
          assignmentsSubmitted: 0,
          assignmentsEvaluated: 0,
          assignmentsPending: 0,
          evaluatedMarksSum: 0,
          evaluatedMaxMarksSum: 0,
          quizAttempts: 0,
          quizPercentageSum: 0,
          lastActivityAt: null,
          hasProgressRecord: false,
        });
      } else if (userInfo && studentMap.get(key).name === "Unknown Student") {
        // Fill in identity if we saw the activity record before the
        // progress record (order of processing shouldn't matter).
        const entry = studentMap.get(key);
        entry.name = userInfo.fullName || entry.name;
        entry.email = userInfo.email || entry.email;
      }
      return studentMap.get(key);
    };

    for (const progress of progressDocs) {
      if (!progress.user) continue; // orphaned record (deleted user) — skip
      const entry = ensureStudent(progress.user._id, progress.user);
      entry.hasProgressRecord = true;
      entry.completedLessonsCount = (progress.completedLessons || []).length;

      for (const a of progress.assignments || []) {
        if (a.status === "Submitted" || a.status === "Evaluated") {
          entry.assignmentsSubmitted += 1;
        }
        if (a.status === "Evaluated") {
          entry.assignmentsEvaluated += 1;
          entry.evaluatedMarksSum += Number(a.marks) || 0;
          entry.evaluatedMaxMarksSum += Number(a.maxMarks) || 0;
        } else if (a.status === "Submitted") {
          entry.assignmentsPending += 1;
        }
      }

      for (const attempt of progress.quizAttempts || []) {
        entry.quizAttempts += 1;
        entry.quizPercentageSum += Number(attempt.percentage) || 0;
      }
    }

    const activeSince = new Date(Date.now() - ACTIVE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const activeStudentIds = new Set();

    for (const activity of activities) {
      if (!activity.student) continue;
      const entry = ensureStudent(activity.student, null);
      const ts = new Date(activity.createdAt);
      if (!entry.lastActivityAt || ts > entry.lastActivityAt) {
        entry.lastActivityAt = ts;
      }
      if (ts >= activeSince) {
        activeStudentIds.add(String(activity.student));
      }
    }

    // Populate missing names/emails for students who only appeared via
    // StudentActivity (no CourseProgress doc yet) — activity docs don't
    // carry populated user info, so do one lean lookup for the rest.
    const unresolvedIds = Array.from(studentMap.values())
      .filter((s) => !s.email)
      .map((s) => s.studentId);

    if (unresolvedIds.length > 0) {
      const users = await User.find({ _id: { $in: unresolvedIds } })
        .select("fullName email")
        .lean();
      const userById = new Map(users.map((u) => [String(u._id), u]));
      for (const id of unresolvedIds) {
        const u = userById.get(id);
        if (u) {
          const entry = studentMap.get(id);
          entry.name = u.fullName || entry.name;
          entry.email = u.email || entry.email;
        }
      }
    }

    const students = Array.from(studentMap.values()).map((s) => {
      const percentage =
        totalLessons > 0
          ? Math.round((s.completedLessonsCount / totalLessons) * 100)
          : 0;
      const hasAnyRecord = s.hasProgressRecord || Boolean(s.lastActivityAt);
      const avgAssignmentScorePercentage =
        s.evaluatedMaxMarksSum > 0
          ? Math.round((s.evaluatedMarksSum / s.evaluatedMaxMarksSum) * 100)
          : null;
      const avgQuizPercentage =
        s.quizAttempts > 0
          ? Math.round(s.quizPercentageSum / s.quizAttempts)
          : null;

      return {
        studentId: s.studentId,
        name: s.name,
        email: s.email,
        progressPercentage: percentage,
        completedLessonsCount: s.completedLessonsCount,
        totalLessons,
        assignmentsSubmitted: s.assignmentsSubmitted,
        assignmentsEvaluated: s.assignmentsEvaluated,
        assignmentsPending: s.assignmentsPending,
        avgAssignmentScorePercentage,
        quizAttempts: s.quizAttempts,
        avgQuizPercentage,
        lastActivityAt: s.lastActivityAt,
        status: deriveStatus(percentage, hasAnyRecord),
      };
    });

    // Most recently active students first; students with no activity
    // at all sort to the end.
    students.sort((a, b) => {
      if (!a.lastActivityAt && !b.lastActivityAt) return 0;
      if (!a.lastActivityAt) return 1;
      if (!b.lastActivityAt) return -1;
      return new Date(b.lastActivityAt) - new Date(a.lastActivityAt);
    });

    // ── Course-level rollups ──
    const totalStudents = students.length;
    const activeStudents = activeStudentIds.size;

    const totalCompletedLessonEntries = students.reduce(
      (sum, s) => sum + s.completedLessonsCount,
      0
    );
    const overallProgressPercentage =
      totalStudents > 0 && totalLessons > 0
        ? Math.round(
            (totalCompletedLessonEntries / (totalStudents * totalLessons)) * 100
          )
        : 0;

    const assignmentSubmissions = students.reduce(
      (sum, s) => sum + s.assignmentsSubmitted,
      0
    );
    const assignmentsEvaluated = students.reduce(
      (sum, s) => sum + s.assignmentsEvaluated,
      0
    );
    const assignmentsPending = students.reduce(
      (sum, s) => sum + s.assignmentsPending,
      0
    );

    const evaluatedWithScores = students.filter(
      (s) => s.avgAssignmentScorePercentage !== null
    );
    const avgAssignmentScorePercentage =
      evaluatedWithScores.length > 0
        ? Math.round(
            evaluatedWithScores.reduce(
              (sum, s) => sum + s.avgAssignmentScorePercentage,
              0
            ) / evaluatedWithScores.length
          )
        : null;
    const quizAttempts = students.reduce(
      (sum, student) => sum + student.quizAttempts,
      0
    );
    const quizStudentsWithScores = students.filter(
      (student) => student.avgQuizPercentage !== null
    );
    const avgQuizPercentage =
      quizStudentsWithScores.length > 0
        ? Math.round(
            quizStudentsWithScores.reduce(
              (sum, student) => sum + student.avgQuizPercentage,
              0
            ) / quizStudentsWithScores.length
          )
        : null;

    // ── Lesson completion distribution (for the analytics chart) ──
    const lessonKeyTitle = buildLessonTitleMap(course);
    const lessonCompletionCounts = new Map(); // "moduleId::lessonId" -> count

    for (const progress of progressDocs) {
      for (const l of progress.completedLessons || []) {
        const key = `${l.moduleId}::${l.lessonId}`;
        lessonCompletionCounts.set(key, (lessonCompletionCounts.get(key) || 0) + 1);
      }
    }

    const lessonCompletionDistribution = [];
    (course.modules || []).forEach((mod) => {
      (mod.lessons || []).forEach((lesson) => {
        const key = `${mod.id}::${lesson.id}`;
        lessonCompletionDistribution.push({
          moduleId: mod.id,
          lessonId: lesson.id,
          lessonTitle: lesson.title || lessonKeyTitle.get(key) || "",
          completedCount: lessonCompletionCounts.get(key) || 0,
        });
      });
    });

    // ── Activity over time (last N days, daily counts) ──
    const timelineStart = new Date();
    timelineStart.setHours(0, 0, 0, 0);
    timelineStart.setDate(timelineStart.getDate() - (ACTIVITY_TIMELINE_DAYS - 1));

    const dayBuckets = new Map(); // 'YYYY-MM-DD' -> count
    for (let i = 0; i < ACTIVITY_TIMELINE_DAYS; i++) {
      const d = new Date(timelineStart);
      d.setDate(d.getDate() + i);
      dayBuckets.set(d.toISOString().slice(0, 10), 0);
    }

    for (const activity of activities) {
      const ts = new Date(activity.createdAt);
      if (ts < timelineStart) continue;
      const key = ts.toISOString().slice(0, 10);
      if (dayBuckets.has(key)) {
        dayBuckets.set(key, dayBuckets.get(key) + 1);
      }
    }

    const activityOverTime = Array.from(dayBuckets.entries()).map(
      ([date, count]) => ({ date, count })
    );

    res.status(200).json({
      success: true,
      data: {
        course: {
          _id: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode,
          totalModules: (course.modules || []).length,
          totalLessons,
        },
        courseStats: {
          totalStudents,
          activeStudents,
          activeWindowDays: ACTIVE_WINDOW_DAYS,
          totalLessons,
          totalCompletedLessonEntries,
          overallProgressPercentage,
          assignmentSubmissions,
          assignmentsEvaluated,
          assignmentsPending,
          avgAssignmentScorePercentage,
          totalAssignments: assignments.length,
          quizzesCreated: quizzes.length,
          quizAttempts,
          avgQuizPercentage,
        },
        lessonCompletionDistribution,
        activityOverTime,
        students,
      },
    });
  } catch (error) {
    console.error("Get Course Progress Overview Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================================================================
// GET /api/faculty/courses/:courseId/students/:studentId/progress
//
// Detail view for a single student within a faculty-owned course.
// ================================================================
const getStudentProgressDetail = async (req, res) => {
  try {
    const course = await loadOwnedCourse(req, res);
    if (!course) return; // response already sent

    const { studentId } = req.params;

    const student = await User.findById(studentId)
      .select("fullName email role")
      .lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found.",
      });
    }

    const [progress, activities, quizzes] = await Promise.all([
      CourseProgress.findOne({ user: studentId, course: course._id }).lean(),
      StudentActivity.find({ student: studentId, course: course._id })
        .sort({ createdAt: -1 })
        .limit(RECENT_ACTIVITY_LIMIT)
        .populate("assignment", "title")
        .populate("quiz", "title")
        .lean(),
      Quiz.find({ course: course._id }).select("_id title").lean(),
    ]);

    // SECURITY / DATA INTEGRITY: only report on students who actually
    // have some recorded relationship to this course (progress or
    // activity). This stops a faculty member from pulling up an
    // arbitrary user id that has nothing to do with their course.
    if (!progress && activities.length === 0) {
      return res.status(404).json({
        success: false,
        message: "This student has no recorded activity in this course.",
      });
    }

    const totalLessons = countTotalLessons(course);
    const lessonKeyTitle = buildLessonTitleMap(course);

    const completedLessons = (progress?.completedLessons || []).map((l) => ({
      moduleId: l.moduleId,
      lessonId: l.lessonId,
      lessonTitle: lessonKeyTitle.get(`${l.moduleId}::${l.lessonId}`) || "",
      completedAt: l.completedAt,
    }));

    const completedLessonsCount = completedLessons.length;
    const percentage =
      totalLessons > 0
        ? Math.round((completedLessonsCount / totalLessons) * 100)
        : 0;

    const assignmentEntries = (progress?.assignments || []).map((a) => ({
      assignmentId: a.assignmentId || null,
      title: a.title || "",
      moduleId: a.moduleId,
      lessonId: a.lessonId,
      status: a.status,
      marks: a.marks,
      maxMarks: a.maxMarks,
      feedback: a.feedback || "",
      submittedAt: a.submittedAt,
      evaluatedAt: a.evaluatedAt,
    }));

    const assignmentsSubmitted = assignmentEntries.filter(
      (a) => a.status === "Submitted" || a.status === "Evaluated"
    ).length;
    const assignmentsEvaluated = assignmentEntries.filter(
      (a) => a.status === "Evaluated"
    ).length;
    const assignmentsPending = assignmentsSubmitted - assignmentsEvaluated;

    const quizTitleById = new Map(
      quizzes.map((quiz) => [String(quiz._id), quiz.title])
    );
    const quizAttempts = (progress?.quizAttempts || []).map((attempt) => ({
      quizId: attempt.quiz,
      title: quizTitleById.get(String(attempt.quiz)) || "Quiz",
      moduleId: attempt.moduleId,
      lessonId: attempt.lessonId,
      score: attempt.score,
      totalMarks: attempt.totalMarks,
      percentage: attempt.percentage,
      correctAnswers: attempt.correctAnswers,
      incorrectAnswers: attempt.incorrectAnswers,
      totalQuestions: attempt.totalQuestions,
      submittedAt: attempt.submittedAt,
    }));

    const recentActivity = activities.map((a) => ({
      activityType: a.activityType,
      moduleId: a.moduleId,
      lessonId: a.lessonId,
      assignmentTitle: a.assignment?.title || a.metadata?.title || null,
      quizTitle: a.quiz?.title || null,
      metadata: a.metadata || {},
      createdAt: a.createdAt,
    }));

    const lastActivityAt = activities.length > 0 ? activities[0].createdAt : null;
    const hasAnyRecord = Boolean(progress) || activities.length > 0;

    res.status(200).json({
      success: true,
      data: {
        student: {
          _id: student._id,
          name: student.fullName,
          email: student.email,
        },
        course: {
          _id: course._id,
          courseName: course.courseName,
          courseCode: course.courseCode,
        },
        progress: {
          completedLessonsCount,
          totalLessons,
          percentage,
          completedLessons,
        },
        assignments: {
          submitted: assignmentsSubmitted,
          evaluated: assignmentsEvaluated,
          pending: assignmentsPending,
          entries: assignmentEntries,
        },
        quizzes: {
          attempts: quizAttempts,
          note: quizAttempts.length
            ? `${quizAttempts.length} quiz attempt${quizAttempts.length === 1 ? "" : "s"} recorded.`
            : "No quiz attempts recorded yet.",
        },
        recentActivity,
        lastActivityAt,
        status: deriveStatus(percentage, hasAnyRecord),
      },
    });
  } catch (error) {
    console.error("Get Student Progress Detail Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCourseProgressOverview,
  getStudentProgressDetail,
};
