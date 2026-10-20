#!/usr/bin/env node
// ==============================================================
// Course content enrichment — resumable batch pipeline.
//
// Usage (from Backend/):
//   npm run content:enrich -- --dry-run                 analyse 25 most popular courses, estimate cost (no LLM calls, no writes)
//   npm run content:enrich -- --dry-run --all           analyse the whole catalog
//   npm run content:enrich -- --dry-run --generate --limit 3 --provider mock
//                                                       generate + validate in memory, write JSON previews to tmp/, no DB writes
//   npm run content:enrich -- --limit 5                 generate and SAVE content for 5 courses
//   npm run content:enrich -- --course COURSE-41295     one specific course (id or courseCode, comma-separated)
//   npm run content:enrich -- --all --yes               full catalog (requires explicit --yes)
//   npm run content:status                              job status summary
//
// See docs/COURSE_CONTENT.md for configuration, cost controls and rollback.
// ==============================================================

require("dotenv").config({ quiet: true });
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const Quiz = require("../models/Quiz");
const Assignment = require("../models/Assignment");
const ContentGenerationJob = require("../models/ContentGenerationJob");
const { getLLMConfig, isConfigured, createLLMClient } = require("../services/llm");
const {
  CONTENT_VERSION,
  createPipeline,
  BudgetExceededError,
  StopRequestedError,
} = require("../services/courseContent/pipeline");

/* ---------- argument parsing ---------- */

const parseArgs = (argv) => {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      args._.push(token);
      continue;
    }
    const [key, inline] = token.slice(2).split("=");
    const next = argv[i + 1];
    if (inline !== undefined) args[key] = inline;
    else if (next !== undefined && !next.startsWith("--")) {
      args[key] = next;
      i++;
    } else args[key] = true;
  }
  return args;
};

const args = parseArgs(process.argv.slice(2));
const num = (value, fallback) => (value === undefined || value === true ? fallback : Number(value));

const HELP = `
Course content enrichment

Selection
  --course <id|code,...>   specific courses
  --course-file <path>     JSON file: array of ids/codes, or { "courses": [{ "courseCode": ... }] }
  --category <name>        e.g. "Web Development"
  --order popular|rating|newest|code   processing order (default popular)
  --limit <n>              process at most n eligible courses
  --all                    no limit (writes also need --yes)

Modes
  --dry-run                no database writes (default: analysis + estimate only)
  --generate               with --dry-run: call the model, validate, write previews to tmp/content-preview
  --status                 print job status summary and exit

Safety / recovery
  --include-active         also process courses that have student progress, quizzes or assignments
  --force                  regenerate even if content is current
  --retry-failed           retry courses whose previous attempt failed
  --yes                    confirm a full-catalog write run

Structure
  --lessons <n>            exact number of lessons per course (e.g. 30 -> 6 modules x 5 lessons)
  --modules <n>            module count to use with --lessons (default: chosen automatically)
  --final-questions <n>    add a course-wide final assessment with n questions (10-25)

Provider and cost controls
  --provider gemini|openai|mock   overrides CONTENT_LLM_PROVIDER / LLM_PROVIDER
  --model <id>             overrides CONTENT_LLM_MODEL / LLM_MODEL
  --rpm <n>                requests per minute throttle (shared by all concurrent courses)
  --thinking low|medium|high   Gemini thinking level (overrides CONTENT_LLM_THINKING / LLM_THINKING)
  --timeout-ms <n>         per-request timeout (long lessons can take minutes)
  --lesson-max-tokens <n>  output token cap per lesson request (default 8192)
  --concurrency <n>        courses generated in parallel (default 1)
  --group-size <n>         lessons per generation request (default 2)
  --max-attempts <n>       validation retries per step (default 3)
  --no-verify              skip the independent answer-key check (saves ~1 small call per lesson group)
  --max-calls <n>          stop the run after n model calls
  --max-output-tokens <n>  stop the run after n output tokens
  --batch-size <n>         courses per progress batch (default 10)
  --pause-ms <n>           pause between batches
`;

// --lessons 30 -> { modules: 6, lessonsPerModule: 5 }. Prefers 6, 5, 4
// or 7 modules with 4-7 lessons each.
const resolveLayout = (lessons, modules) => {
  if (!lessons) return null;
  const fits = (m) => Number.isInteger(m) && m >= 3 && m <= 7 && lessons % m === 0 && lessons / m >= 2 && lessons / m <= 7;
  const chosen = modules ? (fits(modules) ? modules : null) : [6, 5, 4, 7].find(fits);
  if (!chosen) throw new Error(`Cannot split ${lessons} lessons into ${modules || "3-7"} equal modules of 2-7 lessons.`);
  return { modules: chosen, lessonsPerModule: lessons / chosen };
};

/* ---------- estimates ---------- */

const EST = {
  curriculumIn: 900,
  curriculumOut: 1200,
  callInBase: 1800,
  lessonOut: 3000,
  verifyIn: 1000,
  verifyOut: 80,
  bytesPerLesson: 11000,
};

const estimateCourse = (targets, groupSize, verify) => {
  const mid = (range) => {
    const [a, b] = String(range).split("-").map(Number);
    return (a + (b || a)) / 2;
  };
  const modules = mid(targets.modules);
  const perModule = mid(targets.lessons);
  const lessons = modules * perModule;
  const groups = modules * Math.ceil(perModule / groupSize);
  // +1 small answer-key verification call per lesson group unless --no-verify.
  const verifyCalls = verify ? groups : 0;
  return {
    lessons,
    calls: 1 + groups + verifyCalls,
    inputTokens: EST.curriculumIn + groups * EST.callInBase + verifyCalls * EST.verifyIn,
    outputTokens: EST.curriculumOut + lessons * EST.lessonOut + verifyCalls * EST.verifyOut,
    bytes: lessons * EST.bytesPerLesson,
  };
};

/* ---------- status ---------- */

const printStatus = async () => {
  const [byStatus, total, current, failures] = await Promise.all([
    ContentGenerationJob.aggregate([{ $group: { _id: "$status", n: { $sum: 1 } } }]),
    Course.countDocuments(),
    Course.countDocuments({ "contentMeta.version": CONTENT_VERSION }),
    ContentGenerationJob.find({ status: "failed" }).sort({ updatedAt: -1 }).limit(10).select("courseCode lastError updatedAt").lean(),
  ]);
  console.log(`\nCourses: ${total} total, ${current} with content version ${CONTENT_VERSION}`);
  console.log("Jobs:", byStatus.map((s) => `${s._id}=${s.n}`).join("  ") || "none");
  if (failures.length) {
    console.log("\nRecent failures:");
    failures.forEach((f) => console.log(`  ${f.courseCode}: ${String(f.lastError).slice(0, 160)}`));
  }
};

/* ---------- main ---------- */

const main = async () => {
  if (args.help || args.h) {
    console.log(HELP);
    return;
  }

  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is not set.");
  await mongoose.connect(process.env.MONGODB_URI);

  if (args.status) {
    await printStatus();
    return;
  }

  const dryRun = Boolean(args["dry-run"]);
  const generate = Boolean(args.generate);
  const all = Boolean(args.all);
  const courseRefs = typeof args.course === "string" ? args.course.split(",").map((s) => s.trim()).filter(Boolean) : [];
  if (typeof args["course-file"] === "string") {
    const listed = JSON.parse(fs.readFileSync(path.resolve(args["course-file"]), "utf8"));
    const entries = Array.isArray(listed) ? listed : listed.courses || [];
    courseRefs.push(...entries.map((entry) => String(entry?.courseCode || entry?.id || entry).trim()).filter(Boolean));
    if (!courseRefs.length) throw new Error(`No courses found in ${args["course-file"]}.`);
  }
  let limit = num(args.limit, null);

  const layout = resolveLayout(num(args.lessons, null), num(args.modules, null));
  const finalQuestions = num(args["final-questions"], 0);
  if (finalQuestions && (finalQuestions < 10 || finalQuestions > 25)) throw new Error("--final-questions must be between 10 and 25.");

  if (generate && !dryRun) throw new Error("--generate is only used together with --dry-run.");
  if (!dryRun && !courseRefs.length && !limit && !all) {
    throw new Error("Refusing to write without a scope. Pass --limit <n>, --course <ref>, or --all --yes (or use --dry-run).");
  }
  if (!dryRun && all && !args.yes) {
    throw new Error("Full-catalog write requested. Re-run with --all --yes to confirm (try --dry-run --all first).");
  }
  if (dryRun && !all && !limit && !courseRefs.length) limit = 25;

  const groupSize = Math.max(1, num(args["group-size"], 2));
  const llmNeeded = !dryRun || generate;

  let llm = null;
  if (llmNeeded) {
    const config = getLLMConfig({
      prefix: "CONTENT",
      overrides: {
        ...(args.provider ? { provider: args.provider } : {}),
        ...(args.model ? { model: args.model } : {}),
        ...(args.rpm ? { rpm: Number(args.rpm) } : {}),
        ...(args.thinking ? { thinking: String(args.thinking) } : {}),
        ...(args["timeout-ms"] ? { timeout_ms: Number(args["timeout-ms"]) } : {}),
      },
    });
    if (!isConfigured(config)) {
      throw new Error(
        `No LLM provider configured (provider="${config.provider}"). Set GEMINI_API_KEY in Backend/.env (or CONTENT_LLM_PROVIDER/LLM_PROVIDER with LLM_API_KEY for an openai-compatible provider), or pass --provider mock with --dry-run.`
      );
    }
    llm = createLLMClient(config);
    console.log(
      `Provider: ${llm.name} / ${llm.model}  (rpm ${config.rpm}, thinking ${config.thinking || "default"}, timeout ${Math.round(config.timeoutMs / 1000)}s)`
    );
  }

  const previewDir = generate ? path.join(__dirname, "..", "tmp", "content-preview") : null;
  const pipeline = createPipeline({
    models: { Course, CourseProgress, Quiz, Assignment, ContentGenerationJob },
    llm,
    options: {
      dryRun,
      generate,
      previewDir,
      groupSize,
      maxAttempts: Math.max(1, num(args["max-attempts"], 3)),
      includeActive: Boolean(args["include-active"]),
      force: Boolean(args.force),
      retryFailed: Boolean(args["retry-failed"]),
      allowMockWrites: Boolean(args["allow-mock-writes"]),
      maxCalls: num(args["max-calls"], Infinity),
      maxOutputTokens: num(args["max-output-tokens"], Infinity),
      verifyAnswers: !args["no-verify"],
      lessonMaxOutputTokens: num(args["lesson-max-tokens"], 8192),
      layout,
      finalQuestions,
    },
    log: console.log,
  });

  let interrupted = false;
  process.on("SIGINT", () => {
    if (interrupted) process.exit(130);
    interrupted = true;
    console.log("\nStop requested — finishing the current step and saving progress (Ctrl+C again to force quit)…");
    pipeline.requestStop();
  });

  // Build the selection query.
  const query = {};
  if (courseRefs.length) {
    const ids = courseRefs.filter((ref) => mongoose.isValidObjectId(ref));
    const codes = courseRefs.filter((ref) => !mongoose.isValidObjectId(ref)).map((c) => c.toUpperCase());
    query.$or = [...(ids.length ? [{ _id: { $in: ids } }] : []), ...(codes.length ? [{ courseCode: { $in: codes } }] : [])];
  }
  if (typeof args.category === "string") query.category = args.category;

  const sorts = {
    popular: { students: -1, _id: 1 },
    rating: { rating: -1, _id: 1 },
    newest: { createdAt: -1, _id: 1 },
    code: { courseCode: 1 },
  };
  const sort = sorts[args.order] || sorts.popular;

  const mode = dryRun ? (generate ? "DRY RUN + GENERATE (no DB writes)" : "DRY RUN (analysis only, no LLM calls, no writes)") : "WRITE";
  console.log(`Mode: ${mode}  |  content version ${CONTENT_VERSION}  |  limit ${limit ?? "none"}  |  order ${args.order || "popular"}`);

  const batchSize = Math.max(1, num(args["batch-size"], 10));
  const pauseMs = num(args["pause-ms"], 0);
  const results = [];
  const counts = {};
  let processed = 0;
  let batchCount = 0;
  let stopReason = "";
  const totals = { lessons: 0, calls: 0, inputTokens: 0, outputTokens: 0, bytes: 0 };

  // Fetch ids up front (tiny) rather than holding a cursor open: generation
  // can take longer than the server's idle-cursor timeout.
  const selected = await Course.find(query).select("_id").sort(sort).lean();

  const concurrency = Math.max(1, num(args.concurrency, 1));
  if (courseRefs.length) {
    const found = new Set(selected.map((c) => String(c._id)));
    const foundCodes = new Set((await Course.find({ _id: { $in: [...found] } }).select("courseCode").lean()).map((c) => c.courseCode));
    const unknown = courseRefs.filter((ref) => !found.has(ref) && !foundCodes.has(ref.toUpperCase()));
    if (unknown.length) console.log(`Not found (ignored): ${unknown.join(", ")}`);
  }
  if (layout) console.log(`Structure: ${layout.modules} modules x ${layout.lessonsPerModule} lessons${finalQuestions ? ` + final assessment (${finalQuestions} questions)` : ""}`);

  let nextIndex = 0;
  let inFlight = 0;

  // Each worker takes the next course; `limit` counts courses actually
  // processed (skips do not use it up).
  const worker = async () => {
    while (!stopReason && nextIndex < selected.length) {
      if (limit && processed + inFlight >= limit) return;
      const { _id } = selected[nextIndex++];
      inFlight += 1;
      let result;
      try {
        result = await pipeline.processCourse(_id);
      } catch (error) {
        if (error instanceof BudgetExceededError || error instanceof StopRequestedError) {
          stopReason = stopReason || error.message;
          return;
        }
        throw error;
      } finally {
        inFlight -= 1;
      }
      await report(result);
    }
  };

  const report = (result) => {
    results.push(result);
    counts[result.status] = (counts[result.status] || 0) + 1;

    if (result.status !== "skipped" && result.status !== "missing" && result.status !== "locked") {
      processed += 1;
      batchCount += 1;
    }

    if (result.status === "needs-enrichment") {
      const est = estimateCourse(result.targets, groupSize, !args["no-verify"]);
      Object.keys(totals).forEach((k) => (totals[k] += est[k]));
    }

    const detail =
      result.status === "skipped" || result.status === "locked"
        ? result.reason
        : result.status === "failed"
        ? result.error
        : result.status === "needs-enrichment"
        ? `${result.lessons} lessons; ${result.reasons.join("; ")}`
        : `${result.lessons} lessons${result.finalQuestions ? ` + final assessment (${result.finalQuestions} q)` : ""}, ${result.duration}, quality ${result.qualityScore}${result.previewFile ? `, preview ${path.relative(process.cwd(), result.previewFile)}` : ""}`;
    console.log(`[${result.status}] ${result.courseCode} (${result.profile}) ${result.title?.slice(0, 60)} — ${String(detail).slice(0, 220)}`);

    if (batchCount >= batchSize) {
      batchCount = 0;
      const usage = llm ? `  calls ${llm.usage.calls}, tokens in/out ${llm.usage.inputTokens}/${llm.usage.outputTokens}` : "";
      console.log(`--- batch done: ${processed} processed so far  ${JSON.stringify(counts)}${usage}`);
      if (pauseMs > 0) return new Promise((resolve) => setTimeout(resolve, pauseMs));
    }
    return null;
  };

  await Promise.all(Array.from({ length: concurrency }, worker));

  console.log("\n==== Summary ====");
  console.log(JSON.stringify(counts));
  if (stopReason) console.log(`Stopped early: ${stopReason} (re-run the same command to resume).`);
  if (llm) console.log(`Model usage: ${llm.usage.calls} calls, ${llm.usage.inputTokens} input / ${llm.usage.outputTokens} output tokens`);

  if (dryRun && !generate && counts["needs-enrichment"]) {
    const inPrice = Number(process.env.LLM_PRICE_INPUT_PER_M) || 0;
    const outPrice = Number(process.env.LLM_PRICE_OUTPUT_PER_M) || 0;
    console.log(`\nEstimate for ${counts["needs-enrichment"]} courses (group size ${groupSize}${args["no-verify"] ? ", no answer verification" : ", incl. answer verification"}; first attempts only, retries add more):`);
    console.log(`  ~${Math.round(totals.lessons)} lessons, ~${Math.round(totals.calls)} model calls`);
    console.log(`  ~${(totals.inputTokens / 1e6).toFixed(2)}M input tokens, ~${(totals.outputTokens / 1e6).toFixed(2)}M output tokens`);
    console.log(`  ~${(totals.bytes / 1048576).toFixed(0)} MB of lesson content in MongoDB (replacing the existing placeholder lessons)`);
    if (inPrice || outPrice) {
      const cost = (totals.inputTokens / 1e6) * inPrice + (totals.outputTokens / 1e6) * outPrice;
      console.log(`  ~$${cost.toFixed(2)} at the prices in LLM_PRICE_INPUT_PER_M / LLM_PRICE_OUTPUT_PER_M`);
    } else {
      console.log("  Set LLM_PRICE_INPUT_PER_M and LLM_PRICE_OUTPUT_PER_M (USD per million tokens) to see a cost estimate.");
    }
  }

  const reportDir = path.join(__dirname, "..", "tmp", "content-runs");
  fs.mkdirSync(reportDir, { recursive: true });
  const reportFile = path.join(reportDir, `run-${new Date().toISOString().replace(/[:.]/g, "-")}.json`);
  fs.writeFileSync(
    reportFile,
    JSON.stringify({ runId: pipeline.runId, mode, args, counts, stopReason, usage: llm?.usage || null, estimate: totals, results }, null, 2)
  );
  console.log(`Report: ${path.relative(process.cwd(), reportFile)}`);
};

main()
  .catch((error) => {
    console.error(`\nError: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
