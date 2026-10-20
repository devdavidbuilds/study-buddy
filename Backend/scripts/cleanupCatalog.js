#!/usr/bin/env node
// ==============================================================
// Catalog cleanup — archive approved courses and repair titles.
//
// Safe by default:
//   * DRY RUN unless --apply is given (no writes at all).
//   * Only the ids listed in the approved file are touched; each must
//     still match the courseCode/title recorded at audit time.
//   * Before writing, a full export of the affected courses and all their
//     dependent records is saved and verified (tmp/catalog-cleanup/).
//   * Courses are ARCHIVED, not destroyed: moved into the
//     `archivedcourses` collection with the same _id, inside a
//     transaction. `--restore` moves them back.
//   * Student/faculty records (progress, activity, quizzes, assignments)
//     are never deleted. Courses that have any are refused unless the
//     approved entry sets "allowWithDependents": true.
//   * Idempotent: re-running skips anything already archived/repaired.
//
//   npm run catalog:cleanup -- --plan tmp/catalog-audit/proposed-removals.json            (dry run)
//   npm run catalog:cleanup -- --approved tmp/catalog-audit/approved-cleanup.json         (dry run)
//   npm run catalog:cleanup -- --approved tmp/catalog-audit/approved-cleanup.json --apply --yes
//   npm run catalog:cleanup -- --restore --run <runId> [--apply --yes]
// ==============================================================

require("dotenv").config({ quiet: true });
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const { EJSON } = mongoose.mongo.BSON;
const OUT_DIR = path.join(__dirname, "..", "tmp", "catalog-cleanup");
const ARCHIVE = "archivedcourses";
const CHANGES = "catalogchanges";

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : null;
};

const hashDoc = (doc) => crypto.createHash("sha256").update(EJSON.stringify(doc, { relaxed: false })).digest("hex");

const DEPENDENTS = [
  ["courseprogresses", "course"],
  ["studentactivities", "course"],
  ["quizzes", "course"],
  ["assignments", "course"],
  ["contentgenerationjobs", "course"],
];

const transactionsSupported = async (db) => {
  const hello = await db.admin().command({ hello: 1 });
  return Boolean(hello.setName || hello.msg === "isdbgrid");
};

// Run fn inside a transaction when the server supports it; otherwise run
// it directly (each step below is written to be safe to retry).
const withOptionalTransaction = async (db, fn) => {
  if (!(await transactionsSupported(db))) {
    console.log("Note: server does not support transactions (standalone); using ordered, retry-safe writes.");
    return fn(undefined);
  }
  const session = mongoose.connection.client.startSession();
  try {
    let result;
    await session.withTransaction(async () => {
      result = await fn(session);
    });
    return result;
  } finally {
    await session.endSession();
  }
};

/* ---------------- plan evaluation (read-only) ---------------- */

const evaluatePlan = async (db, plan) => {
  const courses = db.collection("courses");
  const archive = db.collection(ARCHIVE);
  const removals = [];
  const repairs = [];

  for (const entry of plan.courses || []) {
    if (!mongoose.isValidObjectId(entry.id)) {
      removals.push({ entry, action: "skip", reason: "invalid id" });
      continue;
    }
    const _id = new mongoose.Types.ObjectId(entry.id);
    const live = await courses.findOne({ _id });
    const archived = await archive.findOne({ _id }, { projection: { _archive: 1 } });

    const dependents = {};
    for (const [collection, field] of DEPENDENTS) {
      dependents[collection] = await db.collection(collection).countDocuments({ [field]: _id });
    }
    const dependentTotal = Object.values(dependents).reduce((a, b) => a + b, 0);

    if (!live) {
      removals.push({ entry, action: archived ? "already-archived" : "not-found", dependents });
      continue;
    }
    if (live.courseCode !== entry.courseCode || live.courseName !== entry.title) {
      removals.push({ entry, action: "skip", reason: `course changed since audit (now ${live.courseCode} "${live.courseName}")`, dependents });
      continue;
    }
    if (dependentTotal > 0 && !entry.allowWithDependents) {
      removals.push({ entry, action: "skip", reason: "has student/faculty records (needs explicit allowWithDependents)", dependents });
      continue;
    }
    removals.push({ entry, action: "archive", dependents, live });
  }

  for (const entry of plan.titleRepairs || []) {
    const _id = new mongoose.Types.ObjectId(entry.id);
    const live = await courses.findOne({ _id }, { projection: { courseName: 1, courseCode: 1 } });
    if (!live) repairs.push({ entry, action: "not-found" });
    else if (live.courseName === entry.to) repairs.push({ entry, action: "already-repaired" });
    else if (live.courseName !== entry.from) repairs.push({ entry, action: "skip", reason: "title changed since audit" });
    else repairs.push({ entry, action: "repair" });
  }

  return { removals, repairs };
};

const printPlan = ({ removals, repairs }) => {
  console.log("\nCourse removals (archive):");
  for (const r of removals) {
    const deps = Object.entries(r.dependents || {}).filter(([, n]) => n).map(([k, n]) => `${k}=${n}`).join(", ") || "none";
    console.log(`  [${r.action}] ${r.entry.courseCode} "${r.entry.title}"  dependents: ${deps}${r.reason ? `  — ${r.reason}` : ""}`);
  }
  console.log("\nTitle repairs:");
  for (const r of repairs) {
    console.log(`  [${r.action}] ${r.entry.courseCode}: "${r.entry.from}" -> "${r.entry.to}"${r.reason ? `  — ${r.reason}` : ""}`);
  }
  const count = (list, action) => list.filter((x) => x.action === action).length;
  console.log(
    `\nExpected changes: archive ${count(removals, "archive")} course(s), repair ${count(repairs, "repair")} title(s). ` +
      `Already done: ${count(removals, "already-archived") + count(repairs, "already-repaired")}. ` +
      `Skipped: ${count(removals, "skip") + count(repairs, "skip")}. Not found: ${count(removals, "not-found") + count(repairs, "not-found")}.`
  );
  console.log("Student records deleted: 0 (this tool never deletes them).");
};

/* ---------------- backup ---------------- */

const writeVerifiedBackup = async (db, runId, toArchive, toRepair) => {
  const ids = toArchive.map((r) => r.live._id);
  const repairIds = toRepair.map((r) => new mongoose.Types.ObjectId(r.entry.id));
  const backup = {
    runId,
    createdAt: new Date(),
    database: db.databaseName,
    courses: await db.collection("courses").find({ _id: { $in: [...ids, ...repairIds] } }).toArray(),
    dependents: {},
  };
  for (const [collection, field] of DEPENDENTS) {
    backup.dependents[collection] = await db.collection(collection).find({ [field]: { $in: ids } }).toArray();
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, `backup-${runId}.json`);
  fs.writeFileSync(file, EJSON.stringify(backup, { relaxed: false }, 2));

  // Verify: re-read from disk and compare every course document's hash with the database.
  const reread = EJSON.parse(fs.readFileSync(file, "utf8"), { relaxed: false });
  if (reread.courses.length !== backup.courses.length) throw new Error("Backup verification failed: course count mismatch.");
  for (const doc of reread.courses) {
    const current = await db.collection("courses").findOne({ _id: doc._id });
    if (!current || hashDoc(current) !== hashDoc(doc)) throw new Error(`Backup verification failed for ${doc.courseCode}.`);
  }
  return file;
};

/* ---------------- apply ---------------- */

const apply = async (db, evaluation, approvedFile) => {
  const runId = `cleanup-${new Date().toISOString().replace(/[:.]/g, "-")}-${crypto.randomBytes(3).toString("hex")}`;
  const toArchive = evaluation.removals.filter((r) => r.action === "archive");
  const toRepair = evaluation.repairs.filter((r) => r.action === "repair");

  if (!toArchive.length && !toRepair.length) {
    console.log("\nNothing to do — all approved changes are already applied.");
    return;
  }

  const backupFile = await writeVerifiedBackup(db, runId, toArchive, toRepair);
  console.log(`\nVerified backup: ${path.relative(process.cwd(), backupFile)}`);

  await withOptionalTransaction(db, async (session) => {
    const opts = session ? { session } : {};
    const now = new Date();

    for (const r of toArchive) {
      const doc = { ...r.live, _archive: { runId, archivedAt: now, reason: r.entry.reason || "", approvedFile, keepInstead: r.entry.keepInstead || null } };
      // Upsert first, then delete: safe to retry without transactions too.
      await db.collection(ARCHIVE).replaceOne({ _id: r.live._id }, doc, { ...opts, upsert: true });
      const del = await db.collection("courses").deleteOne({ _id: r.live._id, courseCode: r.entry.courseCode }, opts);
      if (del.deletedCount !== 1) throw new Error(`Expected to remove ${r.entry.courseCode}, removed ${del.deletedCount}.`);
    }

    for (const r of toRepair) {
      const _id = new mongoose.Types.ObjectId(r.entry.id);
      const upd = await db.collection("courses").updateOne(
        { _id, courseName: r.entry.from },
        { $set: { courseName: r.entry.to, updatedAt: now } },
        opts
      );
      if (upd.modifiedCount !== 1) throw new Error(`Title repair for ${r.entry.courseCode} did not apply.`);
      await db.collection(CHANGES).insertOne(
        { runId, type: "title-repair", course: _id, courseCode: r.entry.courseCode, field: "courseName", from: r.entry.from, to: r.entry.to, appliedAt: now },
        opts
      );
    }

    await db.collection(CHANGES).insertOne(
      { runId, type: "run", approvedFile, archived: toArchive.map((r) => r.entry.courseCode), repaired: toRepair.map((r) => r.entry.courseCode), backupFile, appliedAt: now },
      opts
    );
  });

  console.log(`Applied run ${runId}: archived ${toArchive.length} course(s), repaired ${toRepair.length} title(s).`);
  console.log(`Undo with: npm run catalog:cleanup -- --restore --run ${runId} --apply --yes`);
};

/* ---------------- restore ---------------- */

const restore = async (db, runId, doApply) => {
  const archived = await db.collection(ARCHIVE).find({ "_archive.runId": runId }).toArray();
  const repairs = await db.collection(CHANGES).find({ runId, type: "title-repair" }).toArray();

  console.log(`Run ${runId}: ${archived.length} archived course(s), ${repairs.length} title repair(s) to undo.`);
  for (const doc of archived) {
    const exists = await db.collection("courses").findOne({ _id: doc._id }, { projection: { _id: 1 } });
    console.log(`  [${exists ? "already-restored" : "restore"}] ${doc.courseCode} "${doc.courseName}"`);
  }
  repairs.forEach((r) => console.log(`  [revert-title] ${r.courseCode}: "${r.to}" -> "${r.from}"`));
  if (!doApply) {
    console.log("\nDry run — pass --apply --yes to restore.");
    return;
  }

  await withOptionalTransaction(db, async (session) => {
    const opts = session ? { session } : {};
    for (const doc of archived) {
      const { _archive, ...course } = doc;
      const exists = await db.collection("courses").findOne({ _id: course._id }, { ...opts, projection: { _id: 1 } });
      if (!exists) await db.collection("courses").insertOne(course, opts);
      await db.collection(ARCHIVE).deleteOne({ _id: course._id }, opts);
    }
    for (const r of repairs) {
      await db.collection("courses").updateOne({ _id: r.course, courseName: r.to }, { $set: { courseName: r.from, updatedAt: new Date() } }, opts);
      await db.collection(CHANGES).updateOne({ _id: r._id }, { $set: { type: "title-repair-reverted", revertedAt: new Date() } }, opts);
    }
  });
  console.log("Restored.");
};

/* ---------------- main ---------------- */

const main = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const doApply = flag("apply");
  if (doApply && !flag("yes")) throw new Error("--apply requires --yes.");

  if (flag("restore")) {
    const runId = value("run");
    if (!runId) throw new Error("--restore needs --run <runId> (see the catalogchanges collection or the apply output).");
    await restore(db, runId, doApply);
    return;
  }

  const approvedFile = value("approved");
  const planFile = approvedFile || value("plan");
  if (!planFile) throw new Error("Pass --plan <proposal.json> for a dry run, or --approved <approved.json>.");
  if (doApply && !approvedFile) throw new Error("--apply only accepts an --approved file (a list you have explicitly approved).");

  const plan = JSON.parse(fs.readFileSync(path.resolve(planFile), "utf8"));
  console.log(`${doApply ? "APPLY" : "DRY RUN (no writes)"} — ${path.basename(planFile)}: ${(plan.courses || []).length} removal(s), ${(plan.titleRepairs || []).length} title repair(s) listed`);
  console.log(`Database: ${db.databaseName}  |  transactions: ${(await transactionsSupported(db)) ? "supported" : "not supported"}`);

  const evaluation = await evaluatePlan(db, plan);
  printPlan(evaluation);

  if (doApply) await apply(db, evaluation, path.basename(planFile));
  else console.log("\nDry run complete — nothing was changed.");
};

main()
  .catch((error) => {
    console.error(`\nError: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
