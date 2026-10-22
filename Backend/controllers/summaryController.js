const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Certificate = require("../models/Certificate");
const Assignment = require("../models/Assignment");
const StudyGoal = require("../models/StudyGoal");
const StudySession = require("../models/StudySession");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");

// ==============================
// GET /api/progress/summary?tz=<minutes>
//
// Everything the student dashboard, Progress, Achievements and Profile
// pages show, computed from the student's real records: their courses and
// completion, streak, XP/level, weekly and monthly activity, upcoming
// assignments, weekly study goals, badges and the leaderboard.
//
// tz is the browser's Date#getTimezoneOffset() so "today" and the
// streak follow the student's local calendar.
// ==============================

// XP rule (shown to students as-is): 50 per lesson completed, 20 per lesson
// check passed (≥ 60%), 30 per module quiz passed (≥ 60%), 200 per
// certificate. Every 1,000 XP is one level.
const XP = { lesson: 50, check: 20, quiz: 30, certificate: 200 };
const PASS_MARK = 60;
const XP_PER_LEVEL = 1000;
const DAY = 86400000;
const DEFAULT_LESSON_MINUTES = 15;

const xpFor = ({ lessons, checks, quizzes, certificates }) =>
  lessons * XP.lesson + checks * XP.check + quizzes * XP.quiz + certificates * XP.certificate;

const round1 = (value) => Math.round(value * 10) / 10;
const WEEKDAY = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// "Aarav Sharma" -> "Aarav S." for the shared leaderboard.
const publicName = (fullName) => {
  const parts = String(fullName || "Student").trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0]}.` : parts[0];
};

const getLearningSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const tz = Math.max(-840, Math.min(840, parseInt(req.query.tz, 10) || 0));
    const localDay = (date) => new Date(new Date(date).getTime() - tz * 60000).toISOString().slice(0, 10);
    const now = new Date();
    const today = localDay(now);

    const [progressDocs, certificates] = await Promise.all([
      CourseProgress.find({ user: userId })
        .select("course completedLessons lessonChecks quizAttempts assignments createdAt updatedAt")
        .lean(),
      Certificate.find({ student: userId }).select("course courseName certificateId issuedAt").lean(),
    ]);

    // Approved enrollments the student hasn't started yet still belong on
    // the dashboard (0% complete).
    const startedIds = new Set(progressDocs.map((p) => String(p.course)));
    const approved = await Enrollment.find({ student: userId, status: "approved" }).select("course createdAt").lean();
    for (const e of approved) {
      if (!startedIds.has(String(e.course))) {
        progressDocs.push({ course: e.course, completedLessons: [], lessonChecks: [], quizAttempts: [], assignments: [], createdAt: e.createdAt, updatedAt: e.createdAt });
      }
    }

    const courseDocs = await Course.find({ _id: { $in: progressDocs.map((p) => p.course) } })
      .select("courseName category thumbnail color level faculty modules.id modules.title modules.lessons.id modules.lessons.title modules.lessons.estimatedMinutes")
      .populate("faculty", "fullName")
      .lean();
    const courseById = new Map(courseDocs.map((c) => [String(c._id), c]));

    // ---------- per-course progress and the event timeline ----------
    const events = []; // { at, minutes, questions, assessment, percentage }
    const courses = [];
    let lessonsCompleted = 0;
    let checksPassed = 0;
    let quizzesPassed = 0;
    let perfectScores = [];

    for (const progress of progressDocs) {
      const course = courseById.get(String(progress.course));
      if (!course) continue;

      const lessons = (course.modules || []).flatMap((m) =>
        (m.lessons || []).map((l) => ({ key: `${m.id}::${l.id}`, moduleId: m.id, lessonId: l.id, title: l.title, minutes: l.estimatedMinutes || DEFAULT_LESSON_MINUTES }))
      );
      const lessonByKey = new Map(lessons.map((l) => [l.key, l]));
      const doneKeys = new Set();
      let lastActivity = progress.createdAt;

      for (const entry of progress.completedLessons || []) {
        const key = `${entry.moduleId}::${entry.lessonId}`;
        const lesson = lessonByKey.get(key);
        if (!lesson || doneKeys.has(key)) continue;
        doneKeys.add(key);
        events.push({ at: entry.completedAt, minutes: lesson.minutes, questions: 0 });
        if (entry.completedAt > lastActivity) lastActivity = entry.completedAt;
      }
      for (const check of progress.lessonChecks || []) {
        events.push({ at: check.submittedAt, minutes: 0, questions: check.total || 0, assessment: true, percentage: check.percentage });
        if (check.percentage >= PASS_MARK) checksPassed += 1;
        if (check.percentage === 100) perfectScores.push(check.submittedAt);
        if (check.submittedAt > lastActivity) lastActivity = check.submittedAt;
      }
      for (const attempt of progress.quizAttempts || []) {
        events.push({ at: attempt.submittedAt, minutes: 0, questions: attempt.totalQuestions || 0, assessment: true, percentage: attempt.percentage });
        if (attempt.percentage >= PASS_MARK) quizzesPassed += 1;
        if (attempt.percentage === 100) perfectScores.push(attempt.submittedAt);
        if (attempt.submittedAt > lastActivity) lastActivity = attempt.submittedAt;
      }

      lessonsCompleted += doneKeys.size;
      const next = lessons.find((l) => !doneKeys.has(l.key)) || null;
      const percentage = lessons.length ? Math.min(100, Math.round((doneKeys.size / lessons.length) * 100)) : 0;
      courses.push({
        _id: course._id,
        courseName: course.courseName,
        category: course.category,
        thumbnail: course.thumbnail,
        color: course.color,
        level: course.level,
        instructor: course.faculty?.fullName || "Study Buddy",
        completedLessons: doneKeys.size,
        totalLessons: lessons.length,
        percentage,
        nextLesson: next ? { moduleId: next.moduleId, lessonId: next.lessonId, title: next.title } : null,
        lastActivityAt: lastActivity,
      });
    }
    courses.sort((a, b) => new Date(b.lastActivityAt) - new Date(a.lastActivityAt));

    // ---------- streak ----------
    const activeDays = new Set(events.map((e) => localDay(e.at)));
    const dayBefore = (key) => new Date(new Date(`${key}T00:00:00Z`).getTime() - DAY).toISOString().slice(0, 10);
    let streak = 0;
    let cursor = activeDays.has(today) ? today : dayBefore(today); // yesterday keeps the streak alive
    while (activeDays.has(cursor)) { streak += 1; cursor = dayBefore(cursor); }
    let longestStreak = 0;
    let run = 0;
    let previous = null;
    let streakReachedThreeAt = null;
    for (const key of [...activeDays].sort()) {
      run = previous && dayBefore(key) === previous ? run + 1 : 1;
      if (run >= 3 && !streakReachedThreeAt) streakReachedThreeAt = `${key}T12:00:00Z`;
      longestStreak = Math.max(longestStreak, run);
      previous = key;
    }

    // ---------- XP and level ----------
    const xp = xpFor({ lessons: lessonsCompleted, checks: checksPassed, quizzes: quizzesPassed, certificates: certificates.length });
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;

    // ---------- weekly (last 7 days) and monthly (last 4 weeks) ----------
    const bucket = (from, to) => {
      const inRange = events.filter((e) => { const k = localDay(e.at); return k >= from && k <= to; });
      return {
        minutes: inRange.reduce((s, e) => s + e.minutes, 0),
        questions: inRange.reduce((s, e) => s + e.questions, 0),
        assessments: inRange.filter((e) => e.assessment).length,
      };
    };
    const shift = (key, days) => new Date(new Date(`${key}T00:00:00Z`).getTime() + days * DAY).toISOString().slice(0, 10);
    const weekly = Array.from({ length: 7 }, (_, i) => {
      const key = shift(today, i - 6);
      const b = bucket(key, key);
      return { day: WEEKDAY[new Date(`${key}T00:00:00Z`).getUTCDay()], date: key, hours: round1(b.minutes / 60), problems: b.questions };
    });
    const monthly = Array.from({ length: 4 }, (_, i) => {
      const to = shift(today, -7 * (3 - i));
      const b = bucket(shift(to, -6), to);
      return { week: `W${i + 1}`, study: round1(b.minutes / 60), quizzes: b.assessments };
    });

    // ---------- upcoming assignments ----------
    const assignmentDocs = await Assignment.find({ course: { $in: courses.map((c) => c._id) }, status: "Published" })
      .select("title course dueDate totalMarks moduleId lessonId")
      .lean();
    const submittedStatus = new Map();
    for (const p of progressDocs) {
      for (const a of p.assignments || []) if (a.assignmentId) submittedStatus.set(String(a.assignmentId), a.status);
    }
    const assignments = assignmentDocs
      .map((a) => ({
        _id: a._id,
        title: a.title,
        courseId: a.course,
        courseName: courseById.get(String(a.course))?.courseName || "",
        dueDate: a.dueDate || null,
        moduleId: a.moduleId,
        lessonId: a.lessonId,
        status: submittedStatus.get(String(a._id)) || "Not Started",
      }))
      .filter((a) => !["Submitted", "Evaluated"].includes(a.status))
      .sort((a, b) => (a.dueDate ? new Date(a.dueDate) : Infinity) - (b.dueDate ? new Date(b.dueDate) : Infinity));

    // ---------- weekly study goals (Planner) ----------
    // Same rule as the Planner page: completed session minutes this week
    // (Monday to Sunday) against the weekly goal.
    const weekday = (new Date(`${today}T00:00:00Z`).getUTCDay() + 6) % 7; // Monday = 0
    const weekFrom = shift(today, -weekday);
    const weekTo = shift(weekFrom, 6);
    const [goalDocs, weekSessions] = await Promise.all([
      StudyGoal.find({ student: userId }).select("course courseName weeklyMinutes").lean(),
      StudySession.find({ student: userId, completed: true }).select("course date durationMinutes").lean(),
    ]);
    const doneThisWeek = new Map();
    for (const s of weekSessions) {
      const key = typeof s.date === "string" ? s.date.slice(0, 10) : localDay(s.date);
      if (key >= weekFrom && key <= weekTo) doneThisWeek.set(String(s.course), (doneThisWeek.get(String(s.course)) || 0) + s.durationMinutes);
    }
    const goals = goalDocs.map((g) => {
      const done = doneThisWeek.get(String(g.course)) || 0;
      return {
        _id: g._id,
        courseId: g.course,
        title: `${g.courseName}: ${round1(g.weeklyMinutes / 60)} h this week`,
        weeklyMinutes: g.weeklyMinutes,
        completedMinutes: done,
        progress: Math.min(100, Math.round((done / g.weeklyMinutes) * 100)),
      };
    });

    // ---------- badges ----------
    const lessonTimes = events.filter((e) => e.minutes > 0).map((e) => new Date(e.at)).sort((a, b) => a - b);
    const certTimes = certificates.map((c) => new Date(c.issuedAt)).sort((a, b) => a - b);
    const startTimes = progressDocs.map((p) => new Date(p.createdAt)).sort((a, b) => a - b);
    perfectScores = perfectScores.map((d) => new Date(d)).sort((a, b) => a - b);
    const badge = (id, icon, title, description, have, need, times) => ({
      id, icon, title, description,
      earned: have >= need,
      earnedAt: have >= need ? (times?.[need - 1] || null) : null,
      progress: Math.min(100, Math.round((have / need) * 100)),
    });
    const badges = [
      badge("first-steps", "🌱", "First Steps", "Complete your first lesson", lessonsCompleted, 1, lessonTimes),
      badge("quiz-ace", "🎯", "Quiz Ace", "Score 100% on a lesson check or quiz", perfectScores.length, 1, perfectScores),
      badge("consistent", "🔥", "Consistent Learner", "Learn on 3 days in a row", longestStreak, 3, streakReachedThreeAt ? [null, null, new Date(streakReachedThreeAt)] : []),
      badge("explorer", "🧭", "Explorer", "Start 3 different courses", progressDocs.length, 3, startTimes),
      badge("finisher", "🎓", "Course Finisher", "Earn your first certificate", certificates.length, 1, certTimes),
      badge("dedicated", "📚", "Dedicated Learner", "Complete 25 lessons", lessonsCompleted, 25, lessonTimes),
      badge("triple-crown", "👑", "Triple Crown", "Earn 3 certificates", certificates.length, 3, certTimes),
    ];

    // ---------- leaderboard (all students, same XP rule) ----------
    const [rows, certCounts] = await Promise.all([
      CourseProgress.aggregate([
        {
          $project: {
            user: 1,
            lessons: { $size: { $ifNull: ["$completedLessons", []] } },
            checks: { $size: { $filter: { input: { $ifNull: ["$lessonChecks", []] }, as: "c", cond: { $gte: ["$$c.percentage", PASS_MARK] } } } },
            quizzes: { $size: { $filter: { input: { $ifNull: ["$quizAttempts", []] }, as: "q", cond: { $gte: ["$$q.percentage", PASS_MARK] } } } },
          },
        },
        { $group: { _id: "$user", lessons: { $sum: "$lessons" }, checks: { $sum: "$checks" }, quizzes: { $sum: "$quizzes" } } },
      ]),
      Certificate.aggregate([{ $group: { _id: "$student", n: { $sum: 1 } } }]),
    ]);
    const certsByUser = new Map(certCounts.map((c) => [String(c._id), c.n]));
    const students = new Map(
      (await User.find({ _id: { $in: rows.map((r) => r._id) }, role: "student" }).select("fullName").lean())
        .map((u) => [String(u._id), u.fullName])
    );
    const ranked = rows
      .filter((r) => students.has(String(r._id)))
      .map((r) => ({
        userId: String(r._id),
        lessons: r.lessons,
        xp: xpFor({ lessons: r.lessons, checks: r.checks, quizzes: r.quizzes, certificates: certsByUser.get(String(r._id)) || 0 }),
      }))
      .sort((a, b) => b.xp - a.xp)
      .map((r, i) => ({ ...r, rank: i + 1 }));
    const me = String(userId);
    const leaderboard = ranked
      .filter((r, i) => i < 5 || r.userId === me)
      .map((r) => ({
        rank: r.rank,
        name: r.userId === me ? students.get(me) : publicName(students.get(r.userId)),
        lessons: r.lessons,
        xp: r.xp,
        isYou: r.userId === me,
      }));

    const completedCourses = courses.filter((c) => c.percentage === 100).length;
    const assessments = events.filter((e) => e.assessment);

    return res.status(200).json({
      success: true,
      data: {
        stats: {
          coursesEnrolled: courses.length,
          coursesCompleted: completedCourses,
          lessonsCompleted,
          certificates: certificates.length,
          assessments: assessments.length,
          averageScore: assessments.length
            ? Math.round(assessments.reduce((s, e) => s + (e.percentage || 0), 0) / assessments.length)
            : null,
          hoursThisWeek: round1(weekly.reduce((s, d) => s + d.hours, 0)),
        },
        xp,
        level,
        xpIntoLevel: xp % XP_PER_LEVEL,
        xpPerLevel: XP_PER_LEVEL,
        xpRule: XP,
        streak,
        longestStreak,
        courses,
        weekly,
        monthly,
        assignments,
        goals,
        badges,
        leaderboard,
      },
    });
  } catch (error) {
    console.error("Learning Summary Error:", error);
    return res.status(500).json({ success: false, message: "Unable to load your learning summary." });
  }
};

module.exports = { getLearningSummary };
