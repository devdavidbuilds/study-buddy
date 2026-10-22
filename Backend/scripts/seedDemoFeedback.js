// ==============================
// Demo course feedback from the seeded demo accounts (@demo.studybuddy.in).
//
//   node scripts/seedDemoFeedback.js            dry run
//   node scripts/seedDemoFeedback.js --apply    write
//
// Only demo students who completed at least 3 lessons of a course leave
// feedback there; the rating follows their average lesson-check score.
// Some other demo students mark feedback "helpful". No faculty replies are
// created — faculty reply live. Re-running replaces demo feedback only.
// ==============================

const path = require("path");
const crypto = require("crypto");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const Enrollment = require("../models/Enrollment");
const CourseFeedback = require("../models/CourseFeedback");

const APPLY = process.argv.includes("--apply");
const DAY = 86400000;

const COMMENTS = {
  5: [
    ["The lessons build up really well — each lesson check made sure I understood before moving on.", ["Clear explanations", "Useful quizzes"]],
    ["Loved the worked examples. The final assessment pulled everything together nicely.", ["Good examples", "Clear explanations"]],
    ["Clear explanations, and the reading list is excellent for going deeper into the topic.", ["Clear explanations", "Great reading list"]],
    ["One of the best courses I've taken here. The module quizzes were exactly the right difficulty.", ["Useful quizzes", "Right pace"]],
  ],
  4: [
    ["Very good overall. A few lessons felt long, but the examples helped a lot.", ["Good examples"]],
    ["Good structure and useful quizzes. I'd like a few more practice exercises per lesson.", ["Useful quizzes", "Needs more practice"]],
    ["Explanations are clear and the lecture notes PDF is really handy for revision.", ["Clear explanations", "Right pace"]],
  ],
  3: [
    ["Decent content, but the pace felt a bit fast in the second module.", ["Too fast"]],
    ["Useful course, though I needed more examples for the harder topics.", ["Needs more practice"]],
    ["Okay overall — some parts were too basic for me, others were very good.", ["Too basic"]],
  ],
  2: [
    ["I found it hard to follow after the first module. More step-by-step examples would really help.", ["Too fast", "Needs more practice"]],
  ],
};

const pick = (list, seed) => list[crypto.createHash("md5").update(seed).digest()[0] % list.length];

const main = async () => {
  await connectDB();
  console.log(`${APPLY ? "*** APPLY ***" : "DRY RUN (add --apply to write)"}  database: ${mongoose.connection.name}`);
  const demo = await User.find({ email: /@demo\.studybuddy\.in$/ }).select("fullName email").lean();
  const demoIds = demo.map((u) => u._id);
  const plans = [];

  for (const user of demo) {
    const approved = new Set((await Enrollment.find({ student: user._id, status: "approved" }).select("course").lean()).map((e) => String(e.course)));
    const progress = await CourseProgress.find({ user: user._id }).select("course completedLessons lessonChecks updatedAt").lean();
    for (const p of progress) {
      if (!approved.has(String(p.course)) || (p.completedLessons || []).length < 3) continue;
      const scores = (p.lessonChecks || []).map((c) => c.percentage);
      const avg = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 70;
      const rating = Math.max(2, Math.min(5, Math.round(1.6 + avg / 28)));
      const [comment, aspects] = pick(COMMENTS[rating], `${user.email}:${p.course}`);
      plans.push({ course: p.course, student: user._id, rating, comment, aspects, at: new Date(new Date(p.updatedAt).getTime() + DAY / 4), who: user.fullName });
    }
  }

  const byRating = plans.reduce((m, p) => ({ ...m, [p.rating]: (m[p.rating] || 0) + 1 }), {});
  console.log(`demo feedback to create: ${plans.length}  ratings: ${JSON.stringify(byRating)}`);
  if (!APPLY) return mongoose.disconnect();

  await CourseFeedback.deleteMany({ student: { $in: demoIds } });
  for (const p of plans) {
    const at = p.at > new Date() ? new Date() : p.at;
    await CourseFeedback.collection.insertOne({
      course: p.course, student: p.student, rating: p.rating, comment: p.comment, aspects: p.aspects,
      helpful: [], createdAt: at, updatedAt: at,
    });
  }
  // A few "helpful" votes from other demo students on the same course.
  const created = await CourseFeedback.find({ student: { $in: demoIds } }).select("course student").lean();
  for (const f of created) {
    const peers = created.filter((o) => String(o.course) === String(f.course) && String(o.student) !== String(f.student)).map((o) => o.student);
    const votes = peers.filter((_, i) => crypto.createHash("md5").update(`${f._id}:${i}`).digest()[0] % 2 === 0);
    if (votes.length) await CourseFeedback.updateOne({ _id: f._id }, { $set: { helpful: votes } });
  }
  console.log(`created ${plans.length} feedback entries`);
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error("Seed feedback failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
