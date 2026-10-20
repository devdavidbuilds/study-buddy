# Course content pipeline

Turns the imported catalog's placeholder lessons into structured lessons:
objectives, an explanation, key concepts, worked examples, real-world
applications, common mistakes and tips, takeaways and revision notes,
practice activities, and a lesson check that the server grades. One
reusable pipeline and one set of UI components cover every course. Only
the activities change with the subject, through subject profiles.

## How it fits together

| Piece | File |
|---|---|
| LLM client (Gemini, OpenAI-compatible, mock), rate limit, retries | `services/llm/` |
| Subject profiles (allowed activities, code yes/no) | `services/courseContent/subjectProfiles.js` |
| Prompts and size targets by level | `services/courseContent/prompts.js` |
| Validation and quality gates | `services/courseContent/validator.js` |
| Duration estimate (reading, examples, practice, check) | `services/courseContent/estimate.js` |
| Orchestration: resume, locks, backup, safe write | `services/courseContent/pipeline.js` |
| Job state, drafts, gzipped backups | `models/ContentGenerationJob.js` |
| CLI | `scripts/enrichCourses.js`, `scripts/rollbackCourseContent.js` |
| Lesson check scoring | `POST /api/progress/:courseId/lesson-check` |
| UI sections | `Frontend/src/components/course/StructuredLessonSections.jsx` |

### Data model (all additions optional, existing documents stay valid)

- `lesson.learning`: `{ objectives, explanation, concepts[], examples[], applications, mistakes[], tips, takeaways, revisionNotes, practice[] }`
- `lesson.estimatedMinutes`, and `lesson.duration` set to e.g. `"25 min"`
- `lesson.quiz[]` is the lesson check. `answer` is the correct option text and `explanation` is new. Both are stripped from every student-facing response.
- `lesson.content` holds a copy of the explanation, so existing renderers and the AI Tutor keep working.
- `course.contentMeta`: `{ version, provider, model, qualityScore, estimatedMinutes, … }`. `course.duration` is set to e.g. `"6.5 hours"`.
- `CourseProgress.lessonChecks[]` stores one entry per lesson. A retake replaces the score and increments `attempts`.

IDs keep the importer's scheme: `module-N`, plus a lesson counter that runs across the whole course (`lesson-N`).
Course `_id`, faculty owner and all other fields are preserved.

## Safety rules built in

- **Dry-run first.** `--dry-run` makes no database writes. Without `--generate` it also makes no model calls.
- **Scope required.** A write run needs `--limit`, `--course`, or `--all --yes`.
- **Courses with activity are skipped.** A course that has student progress, faculty quizzes or assignments is skipped unless you pass `--include-active`. Those records are keyed by lesson IDs, and the new curriculum changes lesson IDs.
- **Validation before saving.** Every lesson is checked for structure, length, 4 unique options, a valid answer key, explanations, activity types allowed for the subject, no code in non-code subjects, no template or placeholder text, relevance to the title, and no near-duplicate lessons.
- **Answer-key verification.** The model re-answers each lesson check without seeing the key, and disagreements are regenerated. Disable it with `--no-verify`.
- **Resumable.** The draft is checkpointed after every lesson group. Interrupting with Ctrl+C, hitting a budget limit or a crash all resume from the last checkpoint, so no paid call is repeated.
- **Safe writes.** Writes use optimistic concurrency: if the course changed while it was being generated, nothing is written. A lock prevents two runners working on the same course.
- **Idempotent.** Courses already at the current content version are skipped. Bump `CONTENT_VERSION` in `pipeline.js` to regenerate after changing prompts or rules.
- **Rollback.** The original modules, duration and outcomes are gzipped into the job before the first write and never overwritten. Rollback restores them exactly.
- **Importer guard.** `npm run import:courses` now refuses to wipe existing courses unless you pass `--replace-existing`.
- **No mock content saved.** The mock provider can't save content unless the test-only `--allow-mock-writes` flag is set.

## Setup

1. Choose a provider and add it to `Backend/.env` (see `.env.example`). Never commit keys.

   ```
   # Google Gemini
   LLM_PROVIDER=gemini
   LLM_API_KEY=<key from https://aistudio.google.com/apikey>
   LLM_MODEL=gemini-3.8-flash   # or the gemini-flash-latest alias; list models available to your key in AI Studio
   LLM_RPM=10

   # or any OpenAI-compatible API (Groq shown)
   LLM_PROVIDER=openai
   LLM_BASE_URL=https://api.groq.com/openai/v1
   LLM_API_KEY=<key>
   LLM_MODEL=llama-3.3-70b-versatile
   ```

   `TUTOR_LLM_*` and `CONTENT_LLM_*` override the shared `LLM_*` values per feature. For example, you can use a cheaper model for the tutor.
   Set `LLM_RPM` at or below your plan's requests-per-minute limit. Free tiers also have **daily** caps, so check your provider's console.

2. Restart the backend. The AI Tutor now answers with the LLM, and the response field `source` changes from `"rules"` to `"llm"`.

## Running it

From `Backend/`:

```bash
# 1. See what needs work and an estimate (no model calls, no writes)
npm run content:enrich -- --dry-run                # 25 most popular courses
npm run content:enrich -- --dry-run --all          # whole catalog

# 2. Generate a small, varied sample WITHOUT saving; inspect tmp/content-preview/*.json
npm run content:enrich -- --dry-run --generate --course COURSE-41295,COURSE-19421,COURSE-49798,COURSE-348116

# 3. Save a small test batch, then check it in the app
npm run content:enrich -- --limit 5
npm run content:status

# 4. Larger batches, with cost controls (re-run the same command to resume)
npm run content:enrich -- --limit 100 --max-calls 2000 --rpm 10
npm run content:enrich -- --category "Web Development" --limit 50
npm run content:enrich -- --retry-failed --limit 50

# Full catalog: only after reviewing the sample, cost and storage notes below
npm run content:enrich -- --all --yes
```

Useful flags: `--order popular|rating|newest|code`, `--group-size 1` for small-context models, `--max-output-tokens`,
`--batch-size`, `--pause-ms`, `--force` (regenerate current content), and `--include-active` (see the safety rules).
Every run writes a JSON report to `tmp/content-runs/`.

### Fixed-size batches (e.g. 30 lessons + final assessment)

```bash
npm run content:enrich -- --course-file tmp/content-batch/batch-30.json \
  --lessons 30 --final-questions 15 --concurrency 3 \
  --thinking low --timeout-ms 600000 --lesson-max-tokens 24000
```

- `--lessons 30` asks for exactly 6 modules x 5 lessons (`--modules` picks another split) and rejects any other plan.
- `--final-questions 15` adds a closing **Final Assessment** module: a course review page plus a 15-question
  quiz covering every module (`learning.kind = "final-assessment"`), answer-checked like lesson checks and
  scored by the existing lesson-check endpoint.
- `--course-file` takes a JSON array of ids/codes or `{ "courses": [{ "courseCode": ... }] }`.
- `--concurrency` runs several courses at once; `--rpm` still caps requests across all of them.
- Gemini 3.x thinks at length by default (1-2 minutes even for tiny replies); `--thinking low` / `LLM_THINKING=low`
  keeps it practical. A **daily** quota 429 stops the run immediately (drafts kept); re-run the same command
  the next day to resume. Per-minute 429s are retried after the delay Gemini asks for.

## Cost, time and storage (measured on this catalog, 2026-10-20)

A dry run over the live database found 3,672 courses: 3,670 need content and 2 have student or assignment records.
The rough first-attempt estimate for the whole catalog is about 68,500 lessons, about 75,700 model calls (including
answer verification), about 104M input tokens and 213M output tokens, and **about 720 MB** of lesson content.

- **Free tiers can't do the whole catalog in reasonable time.** Daily request caps of a few hundred to a few thousand mean months of runtime. Use free tiers for the AI Tutor and a prioritised subset, such as the most popular 50–300 courses (the default order is by popularity).
- **For a paid run**, set `LLM_PRICE_INPUT_PER_M` and `LLM_PRICE_OUTPUT_PER_M` and rerun the dry run to see the dollar figure for current prices.
- **MongoDB Atlas M0 has a 512 MB storage limit.** The current data is already about 230 MB uncompressed, so the full catalog will not fit on M0. Either enrich a subset, or move to a larger tier first.

## Verifying results

- Run `npm run content:status`. It shows job counts and the latest failure messages.
- Look at `ContentGenerationJob.qualityScore` and `warnings`. The score starts at 100 and loses 5 per warning.
- Open a migrated course in the app and check:
  - lessons render all sections;
  - the lesson check scores and shows explanations;
  - "Mark Complete" unlocks after the check;
  - the progress ring, the "lessons left" count and remaining time all agree.
- Spot-check a few lessons per subject for factual accuracy. Automated checks catch structural and answer-key problems, not every factual error.

## Rollback

```bash
npm run content:rollback -- --course COURSE-41295 --dry-run
npm run content:rollback -- --course COURSE-41295
npm run content:rollback -- --all --yes
```

This restores the original modules, duration and outcomes and removes `contentMeta`. Student progress, lesson checks,
quizzes and assignments are never deleted. Completion records for lessons that no longer exist are kept, but they
don't count towards the percentage.

## Student-facing behaviour

- Structured lessons show objectives, the reading, key concepts, worked examples, applications, common mistakes and tips, takeaways and revision notes, practice (hints and model answers on request), and the lesson check.
- A structured lesson can be completed once its lesson check has been submitted (any score), plus the faculty assignment if one exists. The server enforces this.
- Lessons without structured content keep the original flow: the quick check, now graded correctly by the server, and the assignment prompt.
- Estimated total and remaining time are shown in the lesson sidebar, the lesson header and on the course page. There are no timers.
