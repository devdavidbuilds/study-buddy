#!/usr/bin/env node
// ==============================================================
// Roll back content written by scripts/enrichCourses.js.
//
// Restores each course's original modules / duration / outcomes from
// the gzipped backup stored in its ContentGenerationJob, and removes
// contentMeta. Student progress, quizzes and assignments are untouched.
//
//   npm run content:rollback -- --course COURSE-41295 --dry-run
//   npm run content:rollback -- --course COURSE-41295
//   npm run content:rollback -- --all --yes
// ==============================================================

require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");

const Course = require("../models/Course");
const ContentGenerationJob = require("../models/ContentGenerationJob");
const { gunzipJson } = require("../services/courseContent/pipeline");

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const value = (name) => {
  const index = argv.indexOf(`--${name}`);
  return index >= 0 && argv[index + 1] && !argv[index + 1].startsWith("--") ? argv[index + 1] : null;
};

const main = async () => {
  const refs = (value("course") || "").split(",").map((s) => s.trim()).filter(Boolean);
  const all = flag("all");
  const dryRun = flag("dry-run");

  if (!refs.length && !all) throw new Error("Pass --course <id|code,...> or --all --yes.");
  if (all && !flag("yes") && !dryRun) throw new Error("Rolling back every course requires --all --yes.");

  await mongoose.connect(process.env.MONGODB_URI);

  const jobQuery = { "backup.data": { $ne: null } };
  if (refs.length) {
    const ids = refs.filter((r) => mongoose.isValidObjectId(r));
    const codes = refs.filter((r) => !mongoose.isValidObjectId(r)).map((c) => c.toUpperCase());
    jobQuery.$or = [...(ids.length ? [{ course: { $in: ids } }] : []), ...(codes.length ? [{ courseCode: { $in: codes } }] : [])];
  }

  const jobs = await ContentGenerationJob.find(jobQuery);
  if (!jobs.length) console.log("No backups found for the selected courses.");

  for (const job of jobs) {
    const original = gunzipJson(job.backup.data);
    const lessons = (original.modules || []).reduce((n, m) => n + (m.lessons || []).length, 0);

    if (dryRun) {
      console.log(`[dry-run] ${job.courseCode}: would restore ${original.modules.length} modules / ${lessons} lessons, duration "${original.duration}"`);
      continue;
    }

    const update = {
      $set: {
        modules: original.modules,
        duration: original.duration,
        outcomes: original.outcomes || [],
        updatedAt: new Date(),
      },
    };
    if (original.contentMeta) update.$set.contentMeta = original.contentMeta;
    else update.$unset = { contentMeta: "" };

    // Native driver write so the original documents are restored byte for
    // byte (Mongoose casting would add the newer schema's default fields).
    const result = await Course.collection.updateOne({ _id: job.course }, update);
    if (!result.matchedCount) {
      console.log(`[missing] ${job.courseCode}: course no longer exists`);
      continue;
    }

    job.status = "rolled_back";
    job.rolledBackAt = new Date();
    job.draft = { curriculum: null, lessons: {}, lessonWarnings: {} };
    job.markModified("draft");
    await job.save();
    console.log(`[restored] ${job.courseCode}: ${original.modules.length} modules / ${lessons} lessons`);
  }
};

main()
  .catch((error) => {
    console.error(`Error: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
