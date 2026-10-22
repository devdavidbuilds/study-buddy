const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Assignment = require("../models/Assignment");
const StudentActivity = require("../models/StudentActivity");

// ==============================
// GET /api/faculty/courses/overview
// Faculty dashboard figures for the courses the logged-in faculty member
// owns (admins: all courses): students with progress, published
// assignments, average course completion and recent student activity.
// ==============================

const ACTIVITY_TEXT = {
  COURSE_OPENED: "opened",
  LESSON_OPENED: "opened a lesson in",
  LESSON_COMPLETED: "completed a lesson in",
  QUIZ_COMPLETED: "completed a quiz in",
  ASSIGNMENT_SUBMITTED: "submitted an assignment in",
  ASSIGNMENT_EVALUATED: "had an assignment graded in",
};

const getFacultyOverview = async (req, res) => {
  try {
    const owned = req.user.role === "admin" ? {} : { faculty: req.user._id };
    const courseIds = (await Course.find(owned).select("_id").lean()).map((c) => c._id);

    const [progressDocs, activeAssignments] = await Promise.all([
      CourseProgress.find({ course: { $in: courseIds } }).select("user course completedLessons").lean(),
      Assignment.countDocuments({ course: { $in: courseIds }, status: "Published" }),
    ]);

    // Average completion over every student-course pair, using only
    // completions of lessons that still exist in the course.
    const studied = [...new Set(progressDocs.map((p) => String(p.course)))];
    const lessonKeys = new Map(
      (await Course.find({ _id: { $in: studied } }).select("modules.id modules.lessons.id").lean()).map((c) => [
        String(c._id),
        new Set((c.modules || []).flatMap((m) => (m.lessons || []).map((l) => `${m.id}::${l.id}`))),
      ])
    );
    const percentages = progressDocs
      .map((p) => {
        const keys = lessonKeys.get(String(p.course));
        if (!keys || !keys.size) return null;
        const done = new Set((p.completedLessons || []).map((l) => `${l.moduleId}::${l.lessonId}`).filter((k) => keys.has(k)));
        return Math.min(100, Math.round((done.size / keys.size) * 100));
      })
      .filter((v) => v !== null);

    // Courses that have students, most students first — the ones worth
    // opening on the Student Progress page.
    const studentsPerCourse = new Map();
    for (const p of progressDocs) {
      const key = String(p.course);
      if (!studentsPerCourse.has(key)) studentsPerCourse.set(key, new Set());
      studentsPerCourse.get(key).add(String(p.user));
    }
    const activeCourses = (await Course.find({ _id: { $in: studied } }).select("courseName courseCode thumbnail color").lean())
      .map((c) => ({ ...c, students: studentsPerCourse.get(String(c._id))?.size || 0 }))
      .sort((a, b) => b.students - a.students || a.courseName.localeCompare(b.courseName));

    const activity = await StudentActivity.find({ course: { $in: courseIds }, activityType: { $in: Object.keys(ACTIVITY_TEXT) } })
      .sort({ createdAt: -1 })
      .limit(6)
      .populate("student", "fullName")
      .populate("course", "courseName")
      .lean();

    return res.status(200).json({
      success: true,
      data: {
        courses: courseIds.length,
        students: new Set(progressDocs.map((p) => String(p.user))).size,
        activeAssignments,
        averageProgress: percentages.length ? Math.round(percentages.reduce((s, v) => s + v, 0) / percentages.length) : null,
        activeCourses,
        recentActivity: activity.map((a) => ({
          _id: a._id,
          type: a.activityType,
          text: `${a.student?.fullName || "A student"} ${ACTIVITY_TEXT[a.activityType]} ${a.course?.courseName || "a course"}`,
          score: a.metadata?.percentage,
          createdAt: a.createdAt,
        })),
      },
    });
  } catch (error) {
    console.error("Faculty Overview Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load the dashboard overview." });
  }
};

module.exports = { getFacultyOverview };
