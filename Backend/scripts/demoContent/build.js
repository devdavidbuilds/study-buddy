const { assembleCourseContent } = require("../../services/courseContent/assemble");

// ==============================
// Turns the hand-written lesson data in this folder into Course.modules,
// using the same assembler as the AI content pipeline so the result renders
// exactly like pipeline content (structured sections + lesson checks).
//
// Compact lesson format:
//   { t: title, f: focus, s: summary, o: [objectives], x: explanation (markdown),
//     c: [[term, definition]], e: { t, s: scenario, st: [steps], so: solution, code?, lang? },
//     a: [applications], m: [[mistake, fix]], tip: [tips], k: [takeaways],
//     q: [[question, [4 options], correctIndex, explanation]] }
// Course-level `pt` = practice type for the hands-on activity (see
// services/courseContent/subjectProfiles PRACTICE_TYPES), e.g. "coding".
//
// Generated automatically from that data: practice activities, revision
// notes, the final assessment and the module quizzes (see moduleQuizzes).
// ==============================

const fill = (value, vars) => {
  if (typeof value === "string") return value.replace(/\{(\w+)\}/g, (m, key) => (key in vars ? vars[key] : m));
  if (Array.isArray(value)) return value.map((item) => fill(item, vars));
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, fill(item, vars)]));
  }
  return value;
};

const toQuestion = ([question, options, correct, explanation]) => ({
  question,
  options,
  answer: options[correct],
  explanation,
});

const toDraft = (l, practiceType) => ({
  summary: l.s,
  objectives: l.o,
  explanation: l.x.trim(),
  concepts: l.c.map(([term, definition]) => ({ term, definition })),
  examples: [{
    title: l.e.t,
    scenario: l.e.s,
    steps: l.e.st,
    solution: l.e.so,
    code: l.e.code || "",
    language: l.e.code ? l.e.lang || "" : "",
  }],
  applications: l.a,
  mistakes: l.m.map(([mistake, fix]) => ({ mistake, fix })),
  tips: l.tip,
  takeaways: l.k,
  revisionNotes: `${l.s} ${l.k.join(" ")}`,
  practice: [
    {
      type: "conceptual",
      prompt: `Without looking back, explain "${l.c[0][0]}" in one or two sentences.`,
      hint: "Think about what it is and why it matters in this lesson.",
      answer: l.c[0][1],
    },
    {
      type: practiceType,
      prompt: `Redo the worked example "${l.e.t}" on your own, then compare your result with the solution.`,
      hint: l.e.st[0],
      answer: l.e.so,
    },
  ],
  assessment: l.q.map(toQuestion),
});

// Final assessment: questions taken round-robin from every lesson.
const finalAssessmentFor = (modules, count = 12) => {
  const lessons = modules.flatMap((m) => m.ls);
  const questions = [];
  for (let round = 0; questions.length < count && round < 6; round += 1) {
    for (const l of lessons) {
      if (questions.length < count && l.q[round]) questions.push(toQuestion(l.q[round]));
    }
  }
  const review = [
    "## Course review",
    "Work through this summary of every module, then answer the final questions. Each answer comes with an explanation, so use any mistakes as a guide to which lesson to revisit.",
    ...modules.map((m, i) => [
      `### Module ${i + 1}: ${m.t}`,
      m.s,
      ...m.ls.map((l) => `- **${l.t}:** ${l.k[0]}`),
    ].join("\n\n")),
  ].join("\n\n");
  return {
    review,
    takeaways: modules.map((m) => `${m.t}: ${m.s}`),
    revisionNotes: modules.map((m) => m.ls.map((l) => l.k[0]).join(" ")).join(" "),
    questions,
  };
};

// Build the Course fields for one course definition.
// vars: placeholders such as {course} and {topic} for category content.
const buildCourse = (definition, vars = {}) => {
  const def = fill(definition, vars);
  const lessons = {};
  def.mods.forEach((m, mi) => m.ls.forEach((l, li) => { lessons[`${mi}.${li}`] = toDraft(l, def.pt || "scenario"); }));
  const assembled = assembleCourseContent({
    curriculum: {
      modules: def.mods.map((m) => ({ title: m.t, summary: m.s, lessons: m.ls.map((l) => ({ title: l.t, focus: l.f })) })),
      outcomes: def.out,
    },
    lessons,
    finalAssessment: finalAssessmentFor(def.mods),
  });
  return {
    description: def.d.slice(0, 500),
    skills: def.sk,
    outcomes: def.out,
    modules: assembled.modules,
    duration: assembled.duration,
    estimatedMinutes: assembled.estimatedMinutes,
    lessonCount: assembled.lessonCount,
    summary: def.d.slice(0, 300),
  };
};

// Deterministic shuffle so each course's quizzes present options differently.
const seededOrder = (length, seed) => {
  let state = 0;
  for (const ch of String(seed)) state = (state * 31 + ch.charCodeAt(0)) >>> 0;
  const order = [...Array(length).keys()];
  for (let i = length - 1; i > 0; i -= 1) {
    state = (state * 1103515245 + 12345) >>> 0;
    const j = state % (i + 1);
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

// One review quiz per teaching module (Quiz collection), built from that
// module's lesson-check questions, attached to the module's last lesson.
const moduleQuizzes = (modules, seed) =>
  modules
    .filter((m) => m.lessons.every((l) => l.learning?.kind !== "final-assessment"))
    .map((m, index) => {
      const questions = m.lessons.flatMap((l) => l.quiz).slice(0, 6).map((q, qi) => {
        const order = seededOrder(4, `${seed}:${m.id}:${qi}`);
        const options = order.map((i) => q.options[i]);
        return {
          questionText: q.question,
          options,
          correctAnswerIndex: options.indexOf(q.answer),
          marks: 1,
        };
      });
      return {
        title: `Module ${index + 1} Quiz: ${m.title}`,
        moduleId: m.id,
        lessonId: m.lessons[m.lessons.length - 1].id,
        questions,
        totalMarks: questions.length,
        timeLimit: 10,
      };
    });

module.exports = { buildCourse, moduleQuizzes, fill };
