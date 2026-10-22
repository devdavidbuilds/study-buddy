// ==============================
// One-off: introduce course enrollments without locking anyone out.
//
//   node scripts/migrateEnrollments.js                    dry run (no writes)
//   node scripts/migrateEnrollments.js --apply            write
//   node scripts/migrateEnrollments.js --apply --demo-requests
//
// 1. Every student who already has learning activity in a course
//    (completed lessons, lesson checks, quiz attempts or assignments) gets
//    an APPROVED enrollment (source "existing") so they keep their access.
// 2. --demo-requests: a few seeded demo accounts (@demo.studybuddy.in) get
//    PENDING requests for courses they have not joined, so the faculty
//    approval screen has something to show.
// Safe to re-run: existing enrollments are never changed.
// ==============================

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const CourseProgress = require("../models/CourseProgress");
const Course = require("../models/Course");
const User = require("../models/User");
const Enrollment = require("../models/Enrollment");

const APPLY = process.argv.includes("--apply");
const DEMO_REQUESTS = process.argv.includes("--demo-requests");

const DEMO_PENDING = [
  ["ishita.bose@demo.studybuddy.in", "Python for Beginners: Python Programming Language | Tutorial", "I want to learn Python for my data project."],
  ["rohan.mehta@demo.studybuddy.in", "Learning Photoshop CC 2015", "Need Photoshop for our college magazine."],
  ["kavya.subramanian@demo.studybuddy.in", "Logo Design Essentials", ""],
  ["arjun.krishnan@demo.studybuddy.in", "HTML for Beginners", "Starting web development this semester."],
];

const nameKey = (name) => String(name || "").replace(/\s+/g, " ").trim();

const main = async () => {
  await connectDB();
  console.log(`${APPLY ? "*** APPLY ***" : "DRY RUN (add --apply to write)"}  database: ${mongoose.connection.name}`);
  await Enrollment.syncIndexes();

  const students = new Set((await User.find({ role: "student" }).select("_id").lean()).map((u) => String(u._id)));
  const progress = await CourseProgress.find({}).select("user course completedLessons lessonChecks quizAttempts assignments createdAt").lean();
  const active = progress.filter((p) =>
    students.has(String(p.user)) &&
    ((p.completedLessons || []).length || (p.lessonChecks || []).length || (p.quizAttempts || []).length || (p.assignments || []).length)
  );

  let created = 0;
  for (const p of active) {
    const exists = await Enrollment.exists({ student: p.user, course: p.course });
    if (exists) continue;
    created += 1;
    if (APPLY) {
      await Enrollment.create({
        student: p.user,
        course: p.course,
        status: "approved",
        source: "existing",
        requestedAt: p.createdAt,
        decidedAt: p.createdAt,
      });
    }
  }
  console.log(`existing learners: ${active.length} student-course pairs with activity, ${created} new approved enrollments`);

  if (DEMO_REQUESTS) {
    const courses = await Course.find({}).select("courseName").lean();
    for (const [email, courseName, message] of DEMO_PENDING) {
      const user = await User.findOne({ email }).select("_id").lean();
      const course = courses.find((c) => nameKey(c.courseName) === nameKey(courseName));
      if (!user || !course) { console.log(`  skip ${email}: account or course not found`); continue; }
      if (await Enrollment.exists({ student: user._id, course: course._id })) { console.log(`  skip ${email}: already has an enrollment for ${courseName}`); continue; }
      console.log(`  pending request: ${email} -> ${courseName}`);
      if (APPLY) {
        const hoursAgo = 1 + Math.floor(Math.random() * 20);
        await Enrollment.create({ student: user._id, course: course._id, status: "pending", message, requestedAt: new Date(Date.now() - hoursAgo * 3600000) });
      }
    }
  }

  const counts = await Enrollment.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]);
  console.log("enrollments now:", counts.map((c) => `${c._id}=${c.n}`).join(", ") || "none");
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error("Migration failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
