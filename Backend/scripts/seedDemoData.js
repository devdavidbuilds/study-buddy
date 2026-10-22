// ==============================
// Seed Study Buddy with structured course content, quizzes, lecture notes
// and demo student accounts.
//
//   node scripts/seedDemoData.js                         dry run (no writes)
//   node scripts/seedDemoData.js --apply                 every step
//   (the students step needs DEMO_ACCOUNT_PASSWORD set in the environment)
//   node scripts/seedDemoData.js --apply --step content  one step:
//        content | quizzes | materials | students
//
// content   Replaces each course's template lessons with structured,
//           progressive lessons (scripts/demoContent): hand-written,
//           course-specific lessons for the showcase courses and a
//           hand-written curriculum per category for every other course.
//           Module/lesson ids keep the module-N / lesson-N scheme, so
//           existing progress records stay valid where lessons still exist.
// quizzes   One review quiz per module (Quiz collection), generated from
//           that module's lesson-check questions. Upserted, so re-runs
//           update rather than duplicate; faculty-made quizzes are untouched.
// materials A "Lecture Notes" PDF per course (GridFS, like faculty uploads).
//           Courses that already have seeded notes are skipped.
// students  DEMO accounts (@demo.studybuddy.in) with simulated learning
//           history: lesson checks, module quizzes, completed lessons,
//           activity and certificates for finished courses. Re-running
//           replaces only these demo accounts' data. Real users are never
//           modified.
//
// Back up the database before --apply (see D:\db-backups\backup-atlas-db.js).
// ==============================

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
require("dotenv").config({ path: path.join(__dirname, "..", ".env"), quiet: true });

const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Course = require("../models/Course");
const Quiz = require("../models/Quiz");
const LectureMaterial = require("../models/LectureMaterial");
const User = require("../models/User");
const CourseProgress = require("../models/CourseProgress");
const StudentActivity = require("../models/StudentActivity");
const Certificate = require("../models/Certificate");
const { issueCertificate } = require("../utils/certificates");
const {
  INCOMING_DIR, MATERIAL_TYPES, ensureIncomingDir, persistMaterialFile, removeMaterialFile, cleanMaterialName,
} = require("../utils/lectureMaterialFiles");
const { buildCourse, moduleQuizzes } = require("./demoContent/build");
const { buildLectureNotesPdf } = require("./demoContent/lectureNotesPdf");

const APPLY = process.argv.includes("--apply");
const STEP = (() => { const i = process.argv.indexOf("--step"); return i > -1 ? process.argv[i + 1] : "all"; })();
const runs = (step) => STEP === "all" || STEP === step;

const CONTENT_VERSION = 1;
const DEMO_DOMAIN = "demo.studybuddy.in";
// Never committed: pass it as DEMO_ACCOUNT_PASSWORD (min. 8 characters).
const DEMO_PASSWORD = process.env.DEMO_ACCOUNT_PASSWORD || "";
const NOTES_PREFIX = "Lecture Notes: ";

const CATEGORY_CURRICULA = {
  "Web Development": require("./demoContent/categories/webDevelopment"),
  "Business Finance": require("./demoContent/categories/businessFinance"),
  "Musical Instruments": require("./demoContent/categories/musicalInstruments"),
  "Graphic Design": require("./demoContent/categories/graphicDesign"),
};
const SHOWCASE_DIR = path.join(__dirname, "demoContent", "showcase");
// Imported titles sometimes contain non-breaking or repeated spaces.
const nameKey = (name) => String(name || "").replace(/\s+/g, " ").trim();
const SHOWCASE = new Map(
  fs.readdirSync(SHOWCASE_DIR).map((file) => { const def = require(path.join(SHOWCASE_DIR, file)); return [nameKey(def.match), def]; })
);

// {topic} for category curricula, detected from the course title.
const TOPICS = {
  "Web Development": [
    [/\bdjango\b/, "Django"], [/\bflask\b/, "Flask"], [/\bpython\b/, "Python"], [/\bnode(\.?js)?\b/, "Node.js"],
    [/\breact\b/, "React"], [/\bangular/, "Angular"], [/\bvue/, "Vue.js"], [/\bjquery\b/, "jQuery"],
    [/javascript|\bjs\b/, "JavaScript"], [/\bphp\b|laravel|codeigniter/, "PHP"], [/wordpress/, "WordPress"],
    [/bootstrap/, "Bootstrap"], [/\bruby\b|\brails\b/, "Ruby on Rails"], [/asp\.?net|c#/, "ASP.NET"],
    [/\bjava\b/, "Java"], [/\bsql\b|mysql|database/, "databases and SQL"], [/\bhtml|\bcss/, "HTML and CSS"],
  ],
  "Business Finance": [
    [/forex|currency trading/, "forex trading"], [/option/, "options trading"], [/crypto|bitcoin|blockchain/, "cryptocurrency"],
    [/swing|day trad|stock|trading|trader/, "stock trading"], [/accounting|bookkeep|account/, "accounting"],
    [/excel/, "Excel for finance"], [/financial model|valuation/, "financial modelling"], [/real estate|property/, "real estate investing"],
    [/invest/, "investing"], [/statistic|analytics|data/, "business analytics"], [/personal finance|budget|money/, "personal finance"],
  ],
  "Musical Instruments": [
    [/ukulele/, "ukulele"], [/bass guitar|\bbass\b/, "bass guitar"], [/guitar/, "guitar"], [/piano|keyboard/, "piano"],
    [/drum/, "drums"], [/violin|fiddle/, "violin"], [/harmonica/, "harmonica"], [/saxophone|\bsax\b/, "saxophone"],
    [/flute/, "flute"], [/sing|vocal|voice/, "voice"], [/trumpet/, "trumpet"], [/cello/, "cello"],
  ],
  "Graphic Design": [
    [/photoshop/, "Photoshop"], [/illustrator/, "Illustrator"], [/indesign/, "InDesign"], [/logo/, "logo design"],
    [/typograph|font|lettering/, "typography"], [/canva\b/, "Canva"], [/gimp/, "GIMP"], [/inkscape/, "Inkscape"],
    [/infographic/, "infographic design"], [/brand/, "branding"], [/ui\b|ux\b|web design/, "UI design"],
  ],
};
const DEFAULT_TOPIC = {
  "Web Development": "web development",
  "Business Finance": "finance",
  "Musical Instruments": "instrument",
  "Graphic Design": "graphic design",
};
const detectTopic = (course) => {
  const title = course.courseName.toLowerCase();
  const hit = (TOPICS[course.category] || []).find(([pattern]) => pattern.test(title));
  return hit ? hit[1] : DEFAULT_TOPIC[course.category] || course.category;
};

const definitionFor = (course) => {
  const showcase = SHOWCASE.get(nameKey(course.courseName));
  if (showcase) return { def: showcase, vars: {}, kind: "course-specific" };
  const def = CATEGORY_CURRICULA[course.category];
  return def ? { def, vars: { course: course.courseName, topic: detectTopic(course) }, kind: "category-curriculum" } : null;
};

const log = (...args) => console.log(...args);
const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;

// ------------------------------------------------------------
// Step: content
// ------------------------------------------------------------
const seedContent = async (courses) => {
  log(`\n[content] ${courses.length} courses; showcase definitions: ${SHOWCASE.size}`);
  const missingShowcase = [...SHOWCASE.keys()].filter((name) => !courses.some((c) => nameKey(c.courseName) === name));
  if (missingShowcase.length) log("  WARNING showcase course not found:", missingShowcase.join(" | "));

  const stats = { "course-specific": 0, "category-curriculum": 0, skipped: 0, bytes: 0 };
  const topics = {};
  const validated = new Set();
  let batch = [];
  const flush = async () => {
    if (APPLY && batch.length) await Course.bulkWrite(batch, { ordered: false });
    batch = [];
  };

  for (const course of courses) {
    const choice = definitionFor(course);
    if (!choice) { stats.skipped += 1; continue; }
    const built = buildCourse(choice.def, choice.vars);
    if (built.description.length > 500) throw new Error(`Description over 500 characters for ${course.courseName}`);

    const set = {
      description: built.description,
      skills: built.skills,
      outcomes: built.outcomes,
      modules: built.modules,
      duration: built.duration,
      contentMeta: {
        version: CONTENT_VERSION,
        generatedAt: new Date(),
        provider: "study-buddy-curriculum",
        model: choice.kind,
        subjectProfile: course.category,
        estimatedMinutes: built.estimatedMinutes,
        summary: built.summary,
        audience: course.level,
        prerequisites: [],
      },
    };

    // Validate once per definition against the real schema.
    const key = choice.kind === "course-specific" ? course.courseName : course.category;
    if (!validated.has(key)) {
      const error = new Course({ ...course, ...set }).validateSync();
      if (error) throw new Error(`Schema validation failed for ${course.courseName}: ${error.message}`);
      validated.add(key);
    }

    stats[choice.kind] += 1;
    stats.bytes += Buffer.byteLength(JSON.stringify(set.modules));
    if (choice.kind === "category-curriculum") topics[`${course.category}: ${choice.vars.topic}`] = (topics[`${course.category}: ${choice.vars.topic}`] || 0) + 1;
    batch.push({ updateOne: { filter: { _id: course._id }, update: { $set: set } } });
    if (batch.length >= 40) await flush();
  }
  await flush();

  log(`  course-specific: ${stats["course-specific"]}, category curriculum: ${stats["category-curriculum"]}, skipped: ${stats.skipped}`);
  log(`  new lesson data ≈ ${mb(stats.bytes)} (JSON)`);
  log("  topics:", Object.entries(topics).sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}=${n}`).join(", "));
};

// ------------------------------------------------------------
// Step: quizzes
// ------------------------------------------------------------
const seedQuizzes = async () => {
  let courses = 0;
  let quizzes = 0;
  let batch = [];
  const flush = async () => {
    if (APPLY && batch.length) await Quiz.bulkWrite(batch, { ordered: false });
    batch = [];
  };
  const cursor = Course.find(
    { "contentMeta.provider": "study-buddy-curriculum" },
    "faculty modules.id modules.title modules.lessons.id modules.lessons.quiz modules.lessons.learning.kind"
  ).lean().cursor();

  for await (const course of cursor) {
    courses += 1;
    for (const quiz of moduleQuizzes(course.modules, String(course._id))) {
      if (quizzes === 0) {
        const error = new Quiz({ ...quiz, course: course._id, faculty: course.faculty }).validateSync();
        if (error) throw new Error(`Quiz validation failed: ${error.message}`);
      }
      quizzes += 1;
      batch.push({
        updateOne: {
          filter: { course: course._id, moduleId: quiz.moduleId, lessonId: quiz.lessonId, title: quiz.title },
          update: {
            $set: { questions: quiz.questions, totalMarks: quiz.totalMarks, timeLimit: quiz.timeLimit, status: "Published", faculty: course.faculty },
          },
          upsert: true,
        },
      });
      if (batch.length >= 300) await flush();
    }
  }
  await flush();
  log(`\n[quizzes] ${quizzes} module quizzes for ${courses} courses${courses ? "" : " (run the content step first)"}`);
};

// ------------------------------------------------------------
// Step: materials
// ------------------------------------------------------------
const seedMaterials = async (courses) => {
  const existing = new Set(
    (await LectureMaterial.find({ title: { $regex: `^${NOTES_PREFIX}` } }, "course").lean()).map((m) => String(m.course))
  );
  const todo = courses.filter((c) => definitionFor(c) && !existing.has(String(c._id)));
  log(`\n[materials] ${todo.length} lecture-note PDFs to create (${existing.size} already exist)`);
  if (!APPLY || !todo.length) return;

  ensureIncomingDir();
  let done = 0;
  let bytes = 0;
  const one = async (course) => {
    const choice = definitionFor(course);
    const built = buildCourse(choice.def, choice.vars);
    const pdf = await buildLectureNotesPdf({
      courseName: course.courseName,
      category: course.category,
      level: course.level,
      description: built.description,
      outcomes: built.outcomes,
      modules: built.modules,
      full: choice.kind === "course-specific",
    });
    const fileId = crypto.randomUUID();
    const tempPath = path.join(INCOMING_DIR, `${fileId}.pdf`);
    fs.writeFileSync(tempPath, pdf);
    const uploadedBy = course.faculty;
    await persistMaterialFile(
      { fileId, path: tempPath, materialType: MATERIAL_TYPES[".pdf"] },
      { courseId: String(course._id), uploadedBy: String(uploadedBy) }
    );
    try {
      await LectureMaterial.create({
        title: `${NOTES_PREFIX}${course.courseName}`.slice(0, 200),
        description: choice.kind === "course-specific"
          ? "Complete lecture notes: every lesson's explanation, key concepts and takeaways, module by module."
          : "Course notes: the outline, learning objectives, key concepts and takeaways for every lesson.",
        course: course._id,
        moduleId: "",
        uploadedBy,
        file: {
          fileId,
          originalName: cleanMaterialName(`${course.courseName} - Lecture Notes`, ".pdf"),
          size: pdf.length,
          mimeType: MATERIAL_TYPES[".pdf"].mimeType,
          kind: "pdf",
        },
      });
    } catch (error) {
      removeMaterialFile(fileId);
      throw error;
    }
    done += 1;
    bytes += pdf.length;
    if (done % 250 === 0) log(`  ${done}/${todo.length} uploaded (${mb(bytes)})`);
  };

  // Small fixed concurrency keeps memory and Atlas load modest.
  const queue = [...todo];
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (queue.length) await one(queue.shift());
  }));
  log(`  created ${done} PDFs, ${mb(bytes)} in total`);
};

// ------------------------------------------------------------
// Step: students (demo accounts + simulated history)
// ------------------------------------------------------------
const DEMO_STUDENTS = [
  ["Aarav Sharma", "CSE", 3], ["Diya Iyer", "CSE", 2], ["Karthik Raman", "IT", 3], ["Priya Nair", "ECE", 2],
  ["Rohan Mehta", "CSE", 4], ["Ananya Reddy", "IT", 1], ["Vikram Singh", "MECH", 3], ["Sneha Pillai", "EEE", 2],
  ["Arjun Krishnan", "CSE", 1], ["Meera Joshi", "ECE", 4], ["Rahul Verma", "CIVIL", 2], ["Kavya Subramanian", "IT", 3],
  ["Nikhil Patel", "MECH", 1], ["Ishita Bose", "CSE", 2], ["Siddharth Rao", "EEE", 4],
];

// Courses the demo students study: the 8 showcase courses plus 4 popular
// category-curriculum courses.
const EXTRA_COURSES = [
  "Introduction to Web Development",
  "Learning Photoshop CC 2015",
  "Excel Dashboard - Interactive Excel Dashboard and Charts",
  "Piano Lessons for Beginners Made Easy",
];

// Deterministic random numbers so re-runs produce the same history.
const rng = (seed) => {
  let state = crypto.createHash("sha256").update(seed).digest().readUInt32LE(0) || 1;
  const next = () => { state ^= state << 13; state >>>= 0; state ^= state >>> 17; state ^= state << 5; state >>>= 0; return state / 4294967296; };
  next.normal = (mean, sd) => mean + sd * Math.sqrt(-2 * Math.log(next() || 1e-9)) * Math.cos(2 * Math.PI * next());
  next.int = (min, max) => min + Math.floor(next() * (max - min + 1));
  next.pick = (items, count) => { const copy = [...items]; for (let i = copy.length - 1; i > 0; i -= 1) { const j = Math.floor(next() * (i + 1)); [copy[i], copy[j]] = [copy[j], copy[i]]; } return copy.slice(0, count); };
  return next;
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const DAY = 86400000;
const MINUTE = 60000;

// Answer indices for a check where `correctCount` of the questions are right.
const answersFor = (questions, correctCount, rand) => {
  const correctSet = new Set(rand.pick([...questions.keys()], correctCount));
  return questions.map((q, i) => {
    const right = q.correctIndex;
    if (correctSet.has(i)) return right;
    const wrong = [0, 1, 2, 3].filter((x) => x !== right && x < q.optionCount);
    return wrong[Math.floor(rand() * wrong.length)];
  });
};
const binomial = (n, p, rand) => Array.from({ length: n }).reduce((sum) => sum + (rand() < p ? 1 : 0), 0);

const simulateCourse = ({ student, course, quizzesByLesson, ability, targetLessons, start, rand }) => {
  const lessons = course.modules.flatMap((m) => m.lessons.map((l) => ({ moduleId: m.id, lesson: l })));
  const difficulty = rand.normal(0, 6);
  const progress = { completedLessons: [], lessonChecks: [], quizAttempts: [] };
  const activities = [{ activityType: "COURSE_OPENED", at: start, metadata: { courseName: course.courseName } }];
  let t = start;
  let assessments = 0;

  const scoreProbability = (bonus = 0) =>
    clamp((ability - difficulty + 2 * Math.min(assessments, 8) + bonus + rand.normal(0, 7)) / 100, 0.05, 0.98);

  for (const [index, { moduleId, lesson }] of lessons.slice(0, targetLessons).entries()) {
    t += Math.round((0.3 + rand() * 1.8) * DAY);
    const questions = (lesson.quiz || []).map((q) => ({ correctIndex: (q.options || []).indexOf(q.answer), optionCount: (q.options || []).length }));

    let attempts = 1;
    let correct = binomial(questions.length, scoreProbability(), rand);
    if (correct / questions.length < 0.6 && rand() < 0.7) {
      attempts = 2; // retake: only the latest attempt is stored, like the app
      correct = Math.max(correct, binomial(questions.length, scoreProbability(10), rand));
    }
    const percentage = Math.round((correct / questions.length) * 100);
    progress.lessonChecks.push({
      moduleId, lessonId: lesson.id, answers: answersFor(questions, correct, rand), correct,
      total: questions.length, percentage, attempts, submittedAt: new Date(t),
    });
    activities.push({ activityType: "QUIZ_COMPLETED", at: t, moduleId, lessonId: lesson.id,
      metadata: { kind: "lesson-check", title: lesson.title, correct, total: questions.length, percentage } });
    assessments += 1;

    const completedAt = t + rand.int(2, 12) * MINUTE;
    progress.completedLessons.push({ moduleId, lessonId: lesson.id, completedAt: new Date(completedAt) });
    activities.push({ activityType: "LESSON_COMPLETED", at: completedAt, moduleId, lessonId: lesson.id, metadata: { courseName: course.courseName } });

    const quiz = quizzesByLesson.get(`${moduleId}::${lesson.id}`);
    if (quiz && index < targetLessons) {
      const quizAt = completedAt + rand.int(20, 240) * MINUTE;
      const right = binomial(quiz.questions.length, scoreProbability(3), rand);
      const score = right; // 1 mark per question
      const pct = Math.round((score / quiz.totalMarks) * 100);
      progress.quizAttempts.push({
        quiz: quiz._id, moduleId, lessonId: lesson.id, score, totalMarks: quiz.totalMarks, percentage: pct,
        correctAnswers: right, incorrectAnswers: quiz.questions.length - right, totalQuestions: quiz.questions.length,
        submittedAt: new Date(quizAt),
      });
      activities.push({ activityType: "QUIZ_COMPLETED", at: quizAt, moduleId, lessonId: lesson.id, quizId: quiz._id,
        metadata: { title: quiz.title, score, percentage: pct } });
      assessments += 1;
      t = quizAt;
    } else {
      t = completedAt;
    }
  }
  return { progress, activities, finishedAt: t, completedAll: targetLessons >= lessons.length, totalLessons: lessons.length };
};

// Move every timestamp of a simulated history by `delta` milliseconds.
const shiftHistory = (result, delta) => {
  const move = (date) => new Date(date.getTime() + delta);
  for (const entry of result.progress.completedLessons) entry.completedAt = move(entry.completedAt);
  for (const entry of result.progress.lessonChecks) entry.submittedAt = move(entry.submittedAt);
  for (const entry of result.progress.quizAttempts) entry.submittedAt = move(entry.submittedAt);
  for (const activity of result.activities) activity.at += delta;
  result.finishedAt += delta;
};

const seedStudents = async () => {
  const names = [...SHOWCASE.keys(), ...EXTRA_COURSES];
  const wanted = new Set(names.map(nameKey));
  const ids = (await Course.find({}, "courseName").lean()).filter((c) => wanted.has(nameKey(c.courseName))).map((c) => c._id);
  const courses = await Course.find({ _id: { $in: ids } }, "courseName courseCode faculty modules").lean();
  const byName = new Map();
  for (const c of courses) if (!byName.has(nameKey(c.courseName))) byName.set(nameKey(c.courseName), c);
  const studyCourses = names.map((n) => byName.get(nameKey(n))).filter(Boolean);
  if (studyCourses.some((c) => !c.modules?.[0]?.lessons?.[0]?.learning)) {
    if (!APPLY) { log("\n[students] skipped in dry run: the demo courses get structured content in the content step first."); return; }
    throw new Error("Demo courses have no structured content yet - run the content step first.");
  }
  const quizzes = await Quiz.find({ course: { $in: studyCourses.map((c) => c._id) } }, "course moduleId lessonId title questions totalMarks").lean();
  const quizMap = new Map(studyCourses.map((c) => [String(c._id), new Map()]));
  for (const q of quizzes) if (/^Module \d+ Quiz:/.test(q.title)) quizMap.get(String(q.course)).set(`${q.moduleId}::${q.lessonId}`, q);

  log(`\n[students] ${DEMO_STUDENTS.length} demo accounts (@${DEMO_DOMAIN}) across ${studyCourses.length} courses`);
  const now = Date.now();
  const plan = [];

  for (const [index, [fullName, department, yearOfStudy]] of DEMO_STUDENTS.entries()) {
    const [first, ...rest] = fullName.toLowerCase().split(" ");
    const email = `${first}.${rest.join("")}@${DEMO_DOMAIN}`;
    const rand = rng(email);
    const ability = clamp(rand.normal(68, 13), 35, 96);
    // The first account is the presentation account: three finished courses.
    const enrolled = index === 0
      ? ["Python for Beginners: Python Programming Language | Tutorial", "HTML for Beginners", "Typography Fundamentals - Feel confident with type!",
         "Guitar Chords and Basic Strumming", "Basics of Business Statistics (College Level)"].map((n) => byName.get(nameKey(n))).filter(Boolean)
      : rand.pick(studyCourses, rand.int(3, 6));
    const courses = enrolled.map((course, ci) => {
      const total = course.modules.reduce((n, m) => n + m.lessons.length, 0);
      const finish = index === 0 ? ci < 3 : rand() < 0.35;
      const target = finish ? total : clamp(Math.round(total * (0.15 + rand() * 0.7)), 1, total - 1);
      return { course, target };
    });
    plan.push({ fullName, department, yearOfStudy, email, ability, rand, courses, index });
  }

  const summary = { lessonChecks: 0, quizAttempts: 0, completed: 0, activities: 0 };
  for (const p of plan) {
    log(`  ${p.email.padEnd(40)} ability ${p.ability.toFixed(0).padStart(2)}  courses ${p.courses.length}, finishing ${p.courses.filter((c) => c.target >= c.course.modules.reduce((n, m) => n + m.lessons.length, 0)).length}`);
  }
  if (!APPLY) return;
  if (DEMO_PASSWORD.length < 8) throw new Error("Set DEMO_ACCOUNT_PASSWORD (at least 8 characters) to create the demo accounts.");

  for (const p of plan) {
    let user = await User.findOne({ email: p.email }).select("+password");
    if (!user) user = new User({ email: p.email });
    Object.assign(user, {
      fullName: p.fullName,
      password: DEMO_PASSWORD,
      role: "student",
      phone: `+91 90000 ${String(10001 + p.index).slice(-5)}`,
      dateOfBirth: new Date(2003 + (p.index % 3), p.index % 12, 5 + p.index),
      university: "Demo Institute of Technology",
      department: p.department,
      yearOfStudy: p.yearOfStudy,
      rollNumber: `DEMO-${p.department}-${String(p.index + 1).padStart(3, "0")}`,
    });
    await user.save();

    // Replace this demo account's previous seeded data only.
    await Promise.all([
      CourseProgress.deleteMany({ user: user._id }),
      StudentActivity.deleteMany({ student: user._id }),
      Certificate.deleteMany({ student: user._id }),
    ]);

    // Simulate each course's history, then shift it so it ends recently:
    // unfinished courses were active in the last day or two (the
    // presentation account within the last few hours), finished courses
    // ended earlier.
    for (const { course, target } of p.courses) {
      const total = course.modules.reduce((n, m) => n + m.lessons.length, 0);
      const result = simulateCourse({ student: user, course, quizzesByLesson: quizMap.get(String(course._id)), ability: p.ability, targetLessons: target, start: 0, rand: p.rand });
      const finished = target >= total;
      const endsAgo = p.index === 0
        ? (finished ? p.rand.int(2, 9) * DAY : p.rand.int(2, 8) * 60 * MINUTE)
        : (finished ? p.rand.int(2, 14) * DAY : p.rand.int(1, 60) * 60 * MINUTE);
      const delta = now - endsAgo - result.finishedAt;
      shiftHistory(result, delta);
      const start = delta;
      const last = Math.min(result.finishedAt, now - 60 * MINUTE);

      const progressDoc = new CourseProgress({ user: user._id, course: course._id, ...result.progress });
      const error = progressDoc.validateSync();
      if (error) throw new Error(`Progress validation failed: ${error.message}`);
      await CourseProgress.collection.insertOne({ ...progressDoc.toObject(), createdAt: new Date(start), updatedAt: new Date(last) });

      const activityDocs = result.activities.filter((a) => a.at <= now).map((a) => {
        const doc = new StudentActivity({
          student: user._id, activityType: a.activityType, course: course._id,
          moduleId: a.moduleId || null, lessonId: a.lessonId || null, quiz: a.quizId || null, metadata: a.metadata || {},
        }).toObject();
        return { ...doc, createdAt: new Date(a.at), updatedAt: new Date(a.at) };
      });
      if (activityDocs.length) await StudentActivity.collection.insertMany(activityDocs);

      if (result.completedAll) {
        const certificate = await issueCertificate({ studentId: user._id, course, totalLessons: result.totalLessons });
        await Certificate.updateOne({ _id: certificate._id }, { $set: { issuedAt: new Date(last), createdAt: new Date(last) } }, { timestamps: false });
        summary.completed += 1;
      }
      summary.lessonChecks += result.progress.lessonChecks.length;
      summary.quizAttempts += result.progress.quizAttempts.length;
      summary.activities += activityDocs.length;
    }
  }
  log(`  wrote ${summary.lessonChecks} lesson checks, ${summary.quizAttempts} quiz attempts, ${summary.activities} activities, ${summary.completed} certificates`);
  log("  every demo account uses the password from DEMO_ACCOUNT_PASSWORD");
};

// ------------------------------------------------------------
const main = async () => {
  await connectDB();
  log(`${APPLY ? "*** APPLY ***" : "DRY RUN (no writes) - add --apply to write"}  step: ${STEP}  database: ${mongoose.connection.name}`);
  const courses = await Course.find({}, "courseName courseCode category level faculty department semester").lean();

  if (runs("content")) await seedContent(courses);
  if (runs("quizzes")) await seedQuizzes();
  if (runs("materials")) await seedMaterials(courses);
  if (runs("students")) await seedStudents();

  const stats = await mongoose.connection.db.stats();
  log(`\nDatabase ${mongoose.connection.name}: data ${mb(stats.dataSize)} + indexes ${mb(stats.indexSize)}`);
  await mongoose.disconnect();
};

main().catch(async (error) => {
  console.error("Seed failed:", error.message);
  await mongoose.disconnect().catch(() => {});
  process.exit(1);
});
