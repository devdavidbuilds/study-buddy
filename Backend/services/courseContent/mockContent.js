// ==============================
// Deterministic mock payloads for the mock LLM provider.
//
// Used only to exercise the pipeline (dry runs, automated tests) without
// an API key. Every string is visibly labelled [MOCK]; the pipeline
// refuses to save mock output unless explicitly running a test.
// ==============================

const VOCAB = (
  "analysis structure method principle example process review balance signal pattern layer model sequence value context " +
  "decision outcome measure detail framework practice routine rhythm contrast format element factor resource habit stage " +
  "variable result evidence approach constraint option feedback summary comparison workflow technique accuracy clarity"
).split(" ");

const hash = (text) => {
  let h = 2166136261;
  for (const ch of String(text)) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
};

// Pseudo-random but deterministic word salad so mock lessons do not trip
// the duplicate detector.
const words = (seed, count) => {
  let state = hash(seed) || 1;
  const out = [];
  for (let i = 0; i < count; i++) {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    out.push(VOCAB[state % VOCAB.length]);
  }
  return out.join(" ");
};

const mockCurriculum = (course, layout) => {
  const moduleCount = layout?.modules || (course.level === "Advanced" ? 5 : 4);
  const lessonCount = layout?.lessonsPerModule || 3;
  return {
    summary: `[MOCK] Curriculum for ${course.courseName}.`,
    audience: "[MOCK] Students taking this course.",
    prerequisites: ["[MOCK] None"],
    outcomes: [1, 2, 3, 4].map((n) => `[MOCK] Outcome ${n} for ${course.courseName}`),
    modules: Array.from({ length: moduleCount }, (_, mi) => ({
      title: `[MOCK] ${course.courseName} — module ${mi + 1}`,
      summary: `[MOCK] Module ${mi + 1} summary.`,
      lessons: Array.from({ length: lessonCount }, (_, li) => ({
        title: `[MOCK] ${course.courseName} topic ${mi + 1}.${li + 1}`,
        focus: `[MOCK] Covers ${course.courseName} topic ${mi + 1}.${li + 1} in enough detail for testing.`,
      })),
    })),
  };
};

const mockLesson = (title, profile, options = {}) => {
  const seed = `${title}`;
  const practiceType = profile.practiceTypes[0];
  const explanation = [
    `## ${title}`,
    "",
    `[MOCK] ${title} ${words(seed + "a", 120)}.`,
    "",
    `## Details`,
    "",
    `${words(seed + "b", 130)}.`,
    "",
    `${words(seed + "c", 120)}.`,
  ].join("\n");

  return {
    title,
    summary: `[MOCK] Summary of ${title}.`,
    objectives: [1, 2, 3].map((n) => `[MOCK] Explain objective number ${n} of ${title}`),
    explanation,
    concepts: [1, 2, 3].map((n) => ({ term: `[MOCK] Term ${n}`, definition: `[MOCK] Definition number ${n} for ${title} used in tests.` })),
    examples: [
      {
        title: `[MOCK] Worked example for ${title}`,
        scenario: "[MOCK] Scenario text.",
        steps: ["[MOCK] First step.", "[MOCK] Second step."],
        solution: "[MOCK] Solution text.",
        code: profile.allowsCode ? "print('mock')" : "",
        language: profile.allowsCode ? "python" : "",
      },
    ],
    applications: ["[MOCK] Application one."],
    mistakes: [
      { mistake: "[MOCK] Mistake one.", fix: "[MOCK] Fix one." },
      { mistake: "[MOCK] Mistake two.", fix: "[MOCK] Fix two." },
    ],
    tips: ["[MOCK] Tip one."],
    takeaways: ["[MOCK] Takeaway one.", "[MOCK] Takeaway two.", "[MOCK] Takeaway three."],
    revisionNotes: `[MOCK] Revision notes for ${title}. ${words(seed + "d", 30)}.`,
    practice: [1, 2].map((n) => ({
      type: practiceType,
      prompt: `[MOCK] Practice prompt number ${n} asking the learner to apply ${title}.`,
      hint: "[MOCK] Hint.",
      answer: `[MOCK] Model answer number ${n} for this practice item.`,
    })),
    assessment: [0, 1, 2].map((n) => ({
      question: `[MOCK] Assessment question ${n + 1} about ${title}?`,
      options: ["[MOCK] Option A", "[MOCK] Option B", "[MOCK] Option C", "[MOCK] Option D"],
      correctIndex: options.badAnswerKey ? 7 : (n + hash(title)) % 4,
      explanation: `[MOCK] Explanation for question ${n + 1} in this lesson.`,
    })),
  };
};

const mockFinalAssessment = (course, curriculum, questionCount, options = {}) => ({
  review: `## [MOCK] Course review\n\n${words(course.courseName + "review", 320)}.`,
  takeaways: [1, 2, 3, 4, 5].map((n) => `[MOCK] Course takeaway ${n}.`),
  revisionNotes: `[MOCK] Final revision notes. ${words(course.courseName + "notes", 50)}.`,
  questions: Array.from({ length: questionCount }, (_, n) => ({
    module: (n % curriculum.modules.length) + 1,
    question: `[MOCK] Final assessment question ${n + 1} about ${course.courseName}?`,
    options: ["[MOCK] Option A", "[MOCK] Option B", "[MOCK] Option C", "[MOCK] Option D"],
    correctIndex: options.badAnswerKey ? 9 : (n + hash(course.courseName)) % 4,
    explanation: `[MOCK] Explanation for final question ${n + 1} of the course.`,
  })),
});

module.exports = { mockCurriculum, mockLesson, mockFinalAssessment };
