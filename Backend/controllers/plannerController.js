const mongoose = require("mongoose");
const Course = require("../models/Course");
const StudySession = require("../models/StudySession");
const StudyGoal = require("../models/StudyGoal");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const MAX_RANGE_DAYS = 62;
const MAX_REPEAT_WEEKS = 12;

const isValidDate = (value) =>
  DATE_PATTERN.test(value || "") &&
  !Number.isNaN(new Date(`${value}T00:00:00Z`).getTime());

const addDays = (date, days) => {
  const d = new Date(`${date}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const daysBetween = (from, to) =>
  Math.round(
    (new Date(`${to}T00:00:00Z`) - new Date(`${from}T00:00:00Z`)) / 86400000
  );

const toMinutes = (time) => {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
};

// Sessions may not run past midnight or overlap another session that day.
const findConflict = async (studentId, date, startTime, duration, excludeId) => {
  const start = toMinutes(startTime);
  const end = start + duration;

  const sameDay = await StudySession.find({
    student: studentId,
    date,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  })
    .select("startTime durationMinutes courseName")
    .lean();

  return sameDay.find((s) => {
    const sStart = toMinutes(s.startTime);
    return start < sStart + s.durationMinutes && sStart < end;
  });
};

const validationMessage = (error) =>
  Object.values(error.errors)
    .map((e) => e.message)
    .join(" ");

// ==============================
// GET /api/planner/sessions?from=YYYY-MM-DD&to=YYYY-MM-DD
// ==============================
const getSessions = async (req, res) => {
  try {
    const { from, to } = req.query;

    if (!isValidDate(from) || !isValidDate(to) || from > to) {
      return res.status(400).json({
        success: false,
        message: "Valid from and to dates (YYYY-MM-DD) are required.",
      });
    }

    if (daysBetween(from, to) > MAX_RANGE_DAYS) {
      return res.status(400).json({
        success: false,
        message: `Date range cannot exceed ${MAX_RANGE_DAYS} days.`,
      });
    }

    const sessions = await StudySession.find({
      student: req.user._id,
      date: { $gte: from, $lte: to },
    })
      .sort({ date: 1, startTime: 1 })
      .lean();

    return res.status(200).json({ success: true, data: sessions });
  } catch (error) {
    console.error("Get Sessions Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load study sessions.",
    });
  }
};

// ==============================
// POST /api/planner/sessions
// Body: { courseId, date, startTime, durationMinutes, title?, notes?, repeatWeeks? }
//
// repeatWeeks (0-12) adds that many extra weekly copies of the session.
// ==============================
const createSession = async (req, res) => {
  try {
    const {
      courseId,
      date,
      startTime,
      durationMinutes,
      title = "",
      notes = "",
      moduleId = "",
      moduleName = "",
    } = req.body;
    const repeatWeeks = Math.min(
      MAX_REPEAT_WEEKS,
      Math.max(0, parseInt(req.body.repeatWeeks, 10) || 0)
    );
    const duration = Number(durationMinutes);

    if (!mongoose.isValidObjectId(courseId)) {
      return res.status(400).json({
        success: false,
        message: "Please select a course.",
      });
    }

    if (!isValidDate(date) || !TIME_PATTERN.test(startTime || "")) {
      return res.status(400).json({
        success: false,
        message: "A valid date and start time are required.",
      });
    }

    if (!Number.isInteger(duration) || duration < 15 || duration > 480) {
      return res.status(400).json({
        success: false,
        message: "Duration must be between 15 minutes and 8 hours.",
      });
    }

    if (toMinutes(startTime) + duration > 24 * 60) {
      return res.status(400).json({
        success: false,
        message: "A session cannot run past midnight.",
      });
    }

    const course = await Course.findById(courseId)
      .select("courseName courseCode modules")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    let resolvedModuleName = moduleName;
    if (moduleId && !resolvedModuleName && Array.isArray(course.modules)) {
      const mod = course.modules.find(
        (m) => m.id === moduleId || String(m._id) === moduleId
      );
      if (mod) resolvedModuleName = mod.title;
    }

    const dates = Array.from({ length: repeatWeeks + 1 }, (_, i) =>
      addDays(date, i * 7)
    );

    for (const d of dates) {
      const conflict = await findConflict(req.user._id, d, startTime, duration);
      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `This overlaps your ${conflict.courseName} session at ${conflict.startTime} on ${d}.`,
        });
      }
    }

    const sessions = await StudySession.insertMany(
      dates.map((d) => ({
        student: req.user._id,
        course: course._id,
        courseName: course.courseName,
        courseCode: course.courseCode || "",
        moduleId: moduleId || "",
        moduleName: resolvedModuleName || "",
        title,
        notes,
        date: d,
        startTime,
        durationMinutes: duration,
      }))
    );

    return res.status(201).json({
      success: true,
      message:
        sessions.length > 1
          ? `${sessions.length} study sessions scheduled.`
          : "Study session scheduled.",
      data: sessions,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: validationMessage(error),
      });
    }

    console.error("Create Session Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to schedule the study session.",
    });
  }
};

// ==============================
// PATCH /api/planner/sessions/:id
// Body: any of { date, startTime, durationMinutes, title, notes, completed }
// ==============================
const updateSession = async (req, res) => {
  try {
    const session = await StudySession.findOne({
      _id: req.params.id,
      student: req.user._id,
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Study session not found.",
      });
    }

    const {
      date,
      startTime,
      durationMinutes,
      title,
      notes,
      completed,
      moduleId,
      moduleName,
    } = req.body;

    if (date !== undefined) {
      if (!isValidDate(date)) {
        return res.status(400).json({ success: false, message: "Invalid date." });
      }
      session.date = date;
    }
    if (startTime !== undefined) session.startTime = startTime;
    if (durationMinutes !== undefined) {
      session.durationMinutes = Number(durationMinutes);
    }
    if (title !== undefined) session.title = title;
    if (notes !== undefined) session.notes = notes;
    if (moduleId !== undefined) session.moduleId = moduleId;
    if (moduleName !== undefined) session.moduleName = moduleName;
    if (completed !== undefined) {
      session.completed = Boolean(completed);
      session.completedAt = session.completed ? new Date() : null;
    }

    const timingChanged =
      date !== undefined ||
      startTime !== undefined ||
      durationMinutes !== undefined;

    if (timingChanged) {
      if (!TIME_PATTERN.test(session.startTime)) {
        return res.status(400).json({
          success: false,
          message: "Start time must be HH:MM.",
        });
      }

      if (toMinutes(session.startTime) + session.durationMinutes > 24 * 60) {
        return res.status(400).json({
          success: false,
          message: "A session cannot run past midnight.",
        });
      }

      const conflict = await findConflict(
        req.user._id,
        session.date,
        session.startTime,
        session.durationMinutes,
        session._id
      );

      if (conflict) {
        return res.status(409).json({
          success: false,
          message: `This overlaps your ${conflict.courseName} session at ${conflict.startTime}.`,
        });
      }
    }

    await session.save();

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: validationMessage(error),
      });
    }

    console.error("Update Session Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to update the study session.",
    });
  }
};

// ==============================
// DELETE /api/planner/sessions/:id
// ==============================
const deleteSession = async (req, res) => {
  try {
    const result = await StudySession.deleteOne({
      _id: req.params.id,
      student: req.user._id,
    });

    if (!result.deletedCount) {
      return res.status(404).json({
        success: false,
        message: "Study session not found.",
      });
    }

    return res.status(200).json({ success: true, message: "Session removed." });
  } catch (error) {
    console.error("Delete Session Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to remove the study session.",
    });
  }
};

// ==============================
// GET /api/planner/goals
// ==============================
const getGoals = async (req, res) => {
  try {
    const goals = await StudyGoal.find({ student: req.user._id })
      .sort({ courseName: 1 })
      .lean();

    return res.status(200).json({ success: true, data: goals });
  } catch (error) {
    console.error("Get Goals Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to load study goals.",
    });
  }
};

// ==============================
// PUT /api/planner/goals/:courseId
// Body: { weeklyMinutes }  — 0 removes the goal.
// ==============================
const setGoal = async (req, res) => {
  try {
    const weeklyMinutes = Number(req.body.weeklyMinutes);

    if (!Number.isInteger(weeklyMinutes) || weeklyMinutes < 0 || weeklyMinutes > 4200) {
      return res.status(400).json({
        success: false,
        message: "Weekly goal must be between 0 minutes and 70 hours.",
      });
    }

    if (weeklyMinutes === 0) {
      await StudyGoal.deleteOne({
        student: req.user._id,
        course: req.params.courseId,
      });
      return res.status(200).json({ success: true, data: null });
    }

    const course = await Course.findById(req.params.courseId)
      .select("courseName courseCode")
      .lean();

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found.",
      });
    }

    const goal = await StudyGoal.findOneAndUpdate(
      { student: req.user._id, course: course._id },
      {
        weeklyMinutes,
        courseName: course.courseName,
        courseCode: course.courseCode || "",
      },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ success: true, data: goal });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: validationMessage(error),
      });
    }

    console.error("Set Goal Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Unable to save the study goal.",
    });
  }
};

module.exports = {
  getSessions,
  createSession,
  updateSession,
  deleteSession,
  getGoals,
  setGoal,
};
