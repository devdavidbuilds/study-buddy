// Read-only, anonymised export of real assessment history for the
// performance model (ml/performance). It never writes to MongoDB.
//
//   node ml\performance\export_training_data.js            (database from Backend/.env)
//   node ml\performance\export_training_data.js --db test
//
// Output: ml/performance/data/real_history.json (git-ignored). Students and
// courses are replaced by run-local labels (s1, s2, c1, ...); no names,
// emails, ids, answers or feedback are exported — only assessment
// percentages, timestamps, lesson-completion timestamps and lesson counts.
// Records from seeded demo accounts (emails @demo.studybuddy.in, created by
// Backend/scripts/seedDemoData.js) are marked "demo": true so training can
// keep simulated history apart from real students. Emails are not exported.
// Uses Backend/.env for MONGODB_URI; the URI is never printed.

const fs = require("fs");
const path = require("path");

const BACKEND = path.resolve(__dirname, "..", "..", "Backend");
require(path.join(BACKEND, "node_modules", "dotenv")).config({ path: path.join(BACKEND, ".env"), quiet: true });
const mongoose = require(path.join(BACKEND, "node_modules", "mongoose"));

const OUTPUT = path.join(__dirname, "data", "real_history.json");
const DEMO_EMAIL = /@demo\.studybuddy\.in$/i;

const main = async () => {
  const dbArg = process.argv.indexOf("--db");
  const dbName = dbArg > -1 ? process.argv[dbArg + 1] : undefined;
  const uri = (process.env.MONGODB_URI || process.env.MONGO_URI || "").trim();
  if (!uri) throw new Error("MONGODB_URI is not set in Backend/.env");

  await mongoose.connect(uri, { serverSelectionTimeoutMS: 20000, ...(dbName ? { dbName } : {}) });
  const db = mongoose.connection.db;

  const progress = await db
    .collection("courseprogresses")
    .find({}, {
      projection: {
        user: 1,
        course: 1,
        "quizAttempts.percentage": 1,
        "quizAttempts.submittedAt": 1,
        "lessonChecks.percentage": 1,
        "lessonChecks.submittedAt": 1,
        "completedLessons.completedAt": 1,
      },
    })
    .toArray();

  const userIds = [...new Set(progress.map((p) => String(p.user)))]
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const demoUsers = new Set(
    (await db.collection("users").find({ _id: { $in: userIds } }, { projection: { email: 1 } }).toArray())
      .filter((u) => DEMO_EMAIL.test(u.email || ""))
      .map((u) => String(u._id))
  );

  // Lesson counts for just these courses (not the whole catalog).
  const courseIds = [...new Set(progress.map((p) => String(p.course)))]
    .filter((id) => mongoose.isValidObjectId(id))
    .map((id) => new mongoose.Types.ObjectId(id));
  const lessonCounts = new Map(
    (
      await db
        .collection("courses")
        .aggregate([
          { $match: { _id: { $in: courseIds } } },
          { $project: { n: { $sum: { $map: { input: { $ifNull: ["$modules", []] }, as: "m", in: { $size: { $ifNull: ["$$m.lessons", []] } } } } } } },
        ])
        .toArray()
    ).map((c) => [String(c._id), c.n])
  );

  const label = (map, prefix) => (id) => {
    const key = String(id);
    if (!map.has(key)) map.set(key, `${prefix}${map.size + 1}`);
    return map.get(key);
  };
  const studentLabel = label(new Map(), "s");
  const courseLabel = label(new Map(), "c");
  const iso = (d) => (d ? new Date(d).toISOString() : null);

  const records = progress.map((p) => ({
    student: studentLabel(p.user),
    demo: demoUsers.has(String(p.user)),
    course: courseLabel(p.course),
    total_lessons: lessonCounts.get(String(p.course)) || 0,
    completed_at: (p.completedLessons || []).map((l) => iso(l.completedAt)).filter(Boolean),
    // Quiz attempts keep every attempt; lesson checks keep only the latest
    // attempt per lesson (the app replaces them on retake).
    assessments: [
      ...(p.quizAttempts || []).map((a) => ({ kind: "quiz", at: iso(a.submittedAt), score: a.percentage })),
      ...(p.lessonChecks || []).map((c) => ({ kind: "lesson_check", at: iso(c.submittedAt), score: c.percentage })),
    ].filter((a) => a.at && typeof a.score === "number"),
  }));

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(
    OUTPUT,
    JSON.stringify({ source: "real", exported_at: new Date().toISOString(), database: mongoose.connection.name, records }, null, 1)
  );

  for (const [label, subset] of [["real", records.filter((r) => !r.demo)], ["demo", records.filter((r) => r.demo)]]) {
    console.log(`database ${mongoose.connection.name} [${label}]: ${subset.length} progress records, ` +
      `${new Set(subset.map((r) => r.student)).size} students, ${subset.reduce((n, r) => n + r.assessments.length, 0)} assessments`);
  }
  console.log(`wrote ${OUTPUT}`);
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error("Export failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
