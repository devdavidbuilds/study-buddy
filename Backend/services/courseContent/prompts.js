const { PRACTICE_TYPES } = require("./subjectProfiles");
const { LIMITS } = require("./validator");

// ==============================
// Prompt builders for curriculum and lesson generation.
//
// Prompts carry only course metadata the platform already has; the
// original lesson text is template filler, so only its titles are
// offered as optional hints.
// ==============================

// Size targets by level — guidelines handed to the model, not hard rules
// (the validator enforces the wider LIMITS).
// layout: optional exact structure { modules, lessonsPerModule } for a batch.
const structureTargets = (course, layout) => {
  if (layout) {
    const total = layout.modules * layout.lessonsPerModule;
    return {
      modules: String(layout.modules),
      lessons: String(layout.lessonsPerModule),
      hours: `${Math.round(total * 0.5)}-${Math.round(total * 0.75)}`,
      exact: true,
    };
  }
  const level = String(course.level || "Beginner");
  if (level === "Advanced") return { modules: "5-6", lessons: "4-6", hours: "6-10" };
  if (level === "Intermediate") return { modules: "4-6", lessons: "4-5", hours: "5-8" };
  return { modules: "4-5", lessons: "3-5", hours: "4-6" };
};

const SYSTEM_PROMPT = [
  "You are an expert instructional designer and subject-matter teacher writing original course material for Study Buddy, a university learning platform.",
  "Write accurate, clear, original explanations in your own words. Never copy from or mention Udemy, any instructor, or any third-party course.",
  "Do not invent statistics, laws, prices, citations, URLs, or quotes. When numbers are needed, use clearly hypothetical illustrative values.",
  "Do not reference videos or lectures. The material is read, practised and assessed on the page.",
  "Respond with a single JSON object only, matching the requested schema exactly. No markdown fences around the JSON.",
].join(" ");

const courseHeader = (course, profile) =>
  [
    `Course title: ${course.courseName}`,
    `Category: ${course.category || "General"}`,
    `Level: ${course.level || "Beginner"}`,
    course.description ? `Catalog description: ${course.description}` : "",
    (course.skills || []).length ? `Listed skills: ${course.skills.join(", ")}` : "",
    `Subject profile: ${profile.label}. ${profile.guidance}`,
  ]
    .filter(Boolean)
    .join("\n");

const buildCurriculumPrompt = (course, profile, layout) => {
  const targets = structureTargets(course, layout);
  const oldTitles = (course.modules || [])
    .flatMap((m) => (m.lessons || []).map((l) => l.title))
    .slice(0, 12);

  return [
    "Design the curriculum for this course.",
    "",
    courseHeader(course, profile),
    oldTitles.length ? `Existing lesson titles (auto-generated, low quality — use only as loose hints, do not copy): ${oldTitles.join(" | ")}` : "",
    "",
    "Requirements:",
    targets.exact
      ? `- Exactly ${targets.modules} modules with exactly ${targets.lessons} lessons each (${Number(targets.modules) * Number(targets.lessons)} lessons in total), for roughly ${targets.hours} hours of study. Every lesson covers distinct material: progress from first principles to complete, realistic projects or case studies instead of repeating topics.`
      : `- ${targets.modules} modules with ${targets.lessons} lessons each, for roughly ${targets.hours} hours of total study. Fewer lessons is fine for a narrow introductory topic; never pad with repetitive lessons.`,
    targets.exact
      ? null
      : `- Hard limits: ${LIMITS.modules.min}-${LIMITS.modules.max} modules, ${LIMITS.lessonsPerModule.min}-${LIMITS.lessonsPerModule.max} lessons per module.`,
    "- Order lessons from fundamentals to application. Every lesson title must be unique and specific (no 'Part 1/Part 2', no generic 'Introduction' repeated).",
    "- Each lesson's focus states exactly what it teaches, so lessons do not overlap.",
    "- Match the depth to the stated level and audience.",
    "",
    "JSON schema:",
    `{"summary": string (2-3 sentences), "audience": string, "prerequisites": string[], "outcomes": string[4-8], "modules": [{"title": string, "summary": string, "lessons": [{"title": string, "focus": string (1-2 sentences)}]}]}`,
  ]
    .filter((line) => line !== null)
    .join("\n");
};

const lessonSchemaText = (profile) =>
  [
    "{\"lessons\": [{",
    '  "title": string (exactly as given),',
    '  "summary": string (1-2 sentences),',
    `  "objectives": string[${LIMITS.objectives.min}-${LIMITS.objectives.max}] (measurable, start with a verb),`,
    `  "explanation": string (markdown, 500-900 words, use ## subheadings, short paragraphs, bullet lists; teach the topic thoroughly; may include "Note:", "Tip:" or "Definition:" lines${profile.allowsCode ? "; fenced code blocks allowed" : "; no code"}),`,
    `  "concepts": [{"term": string, "definition": string}] (${LIMITS.concepts.min}-${LIMITS.concepts.max}),`,
    `  "examples": [{"title": string, "scenario": string, "steps": string[], "solution": string (markdown), "code": string${profile.allowsCode ? " (optional, runnable)" : " (must be empty)"}, "language": string}] (${LIMITS.examples.min}-${LIMITS.examples.max} fully worked examples),`,
    '  "applications": string[] (2-4 real-world uses),',
    `  "mistakes": [{"mistake": string, "fix": string}] (${LIMITS.mistakes.min}-${LIMITS.mistakes.max}),`,
    '  "tips": string[] (2-4),',
    `  "takeaways": string[${LIMITS.takeaways.min}-${LIMITS.takeaways.max}],`,
    '  "revisionNotes": string (40-120 words, a compact revision summary),',
    `  "practice": [{"type": one of ${JSON.stringify(profile.practiceTypes)}, "prompt": string, "hint": string, "answer": string (model answer or solution)}] (${LIMITS.practice.min}-${LIMITS.practice.max}),`,
    `  "assessment": [{"question": string, "options": string[4], "correctIndex": 0-3, "explanation": string (why the answer is right)}] (${LIMITS.assessment.min}-${LIMITS.assessment.max})`,
    "}]}",
  ].join("\n");

const buildLessonPrompt = ({ course, profile, curriculum, moduleIndex, lessonIndexes, coveredConcepts, feedback }) => {
  const module = curriculum.modules[moduleIndex];
  const outline = curriculum.modules
    .map((m, mi) => `${mi + 1}. ${m.title}: ${m.lessons.map((l) => l.title).join("; ")}`)
    .join("\n");
  const targets = lessonIndexes.map((li) => `- "${module.lessons[li].title}" — ${module.lessons[li].focus}`).join("\n");
  const practiceTypes = profile.practiceTypes.map((type) => `${type} (${PRACTICE_TYPES[type].label})`).join(", ");

  return [
    `Write the complete lesson content for ${lessonIndexes.length === 1 ? "this lesson" : "these lessons"} of module ${moduleIndex + 1}, "${module.title}".`,
    "",
    courseHeader(course, profile),
    `Audience: ${curriculum.audience || "students"}`,
    "",
    "Full course outline (for context — do not write other lessons):",
    outline,
    "",
    "Lessons to write:",
    targets,
    "",
    coveredConcepts.length
      ? `Concepts already taught in earlier lessons (refer back briefly if needed, do not re-teach): ${coveredConcepts.slice(-60).join(", ")}`
      : "",
    "",
    "Requirements:",
    "- Each lesson teaches its own focus in depth with correct, specific information; no generic motivational filler.",
    "- Write for learners meeting the topic for the first time at this level: plain language, define each technical term when it first appears, build from simple to complex, and use concrete, everyday examples. Intermediate and Advanced courses keep their depth but still explain new terms.",
    "- Worked examples show every step. Assessment questions test understanding, have exactly one correct option, plausible distractors, and vary the position of the correct answer.",
    `- Practice activities must use these types only: ${practiceTypes}.`,
    profile.allowsCode ? "- Include code only where it genuinely helps; keep it short and correct." : "- Do not include any programming code.",
    feedback ? `\nA previous attempt was rejected. Fix these problems:\n${feedback}` : "",
    "",
    "JSON schema:",
    lessonSchemaText(profile),
  ]
    .filter((line) => line !== "")
    .join("\n");
};

// Course-wide final assessment, written after every lesson exists so the
// questions draw on what was actually taught.
const buildFinalAssessmentPrompt = ({ course, profile, curriculum, lessons, questionCount, feedback }) => {
  const outline = curriculum.modules
    .map((m, mi) => {
      const taught = m.lessons
        .map((plan, li) => {
          const terms = (lessons[`${mi}.${li}`]?.concepts || []).map((c) => c.term).join(", ");
          return `   - ${plan.title}${terms ? ` (key terms: ${terms})` : ""}`;
        })
        .join("\n");
      return `Module ${mi + 1}: ${m.title}\n${taught}`;
    })
    .join("\n");

  return [
    "Write the final assessment for this course. Students take it after finishing every lesson.",
    "",
    courseHeader(course, profile),
    `Audience: ${curriculum.audience || "students"}`,
    "",
    "What the course taught:",
    outline,
    "",
    "Requirements:",
    `- Exactly ${questionCount} multiple-choice questions spread across all ${curriculum.modules.length} modules (every module tested at least once), each with 4 options, exactly one unambiguously correct, plausible distractors, and the correct position varied.`,
    "- Prefer applied and scenario questions that check understanding over recall of wording. Only test material listed above.",
    "- Each explanation says why the correct option is right and, briefly, why the most tempting wrong option is wrong.",
    '- "review" is a beginner-friendly markdown recap (300-700 words, ## subheadings) of the whole course that helps a student prepare: the main ideas of each module and how they connect.',
    profile.allowsCode ? "- Short code snippets inside questions are allowed where they help." : "- Do not include any programming code.",
    feedback ? `\nA previous attempt was rejected. Fix these problems:\n${feedback}` : "",
    "",
    "JSON schema:",
    `{"review": string, "takeaways": string[5-8], "revisionNotes": string (60-150 words), "questions": [{"module": number (1-${curriculum.modules.length}), "question": string, "options": string[4], "correctIndex": 0-3, "explanation": string}] (exactly ${questionCount})}`,
  ]
    .filter((line) => line !== "")
    .join("\n");
};

module.exports = { SYSTEM_PROMPT, structureTargets, buildCurriculumPrompt, buildLessonPrompt, buildFinalAssessmentPrompt };
