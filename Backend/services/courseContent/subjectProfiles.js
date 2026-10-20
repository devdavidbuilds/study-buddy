// ==============================
// Subject profiles
//
// One reusable description per kind of subject. The profile decides
// which practice activities make sense, whether code is appropriate, and
// how the generator should frame examples. Detection uses the course's
// category plus keywords in its title/description so that, e.g., an SQL
// course inside "Web Development" gets database-style exercises and a
// music course never receives coding tasks.
// ==============================

// Practice activity types understood by the validator, duration estimator
// and frontend. Each profile allows a subset.
const PRACTICE_TYPES = {
  "short-answer": { label: "Short answer", minutes: 3 },
  "output-prediction": { label: "Predict the output", minutes: 3 },
  debugging: { label: "Debugging", minutes: 6 },
  coding: { label: "Coding challenge", minutes: 10 },
  "sql-exercise": { label: "SQL exercise", minutes: 6 },
  "schema-design": { label: "Schema design", minutes: 10 },
  calculation: { label: "Calculation", minutes: 5 },
  derivation: { label: "Derivation", minutes: 8 },
  conceptual: { label: "Conceptual question", minutes: 3 },
  "case-study": { label: "Case study", minutes: 10 },
  scenario: { label: "Decision scenario", minutes: 5 },
  "design-task": { label: "Design challenge", minutes: 12 },
  critique: { label: "Critique", minutes: 5 },
  "technique-drill": { label: "Technique drill", minutes: 8 },
  "listening-task": { label: "Listening task", minutes: 5 },
  "theory-exercise": { label: "Theory exercise", minutes: 4 },
  reflection: { label: "Reflection", minutes: 4 },
  project: { label: "Mini project", minutes: 25 },
};

const PROFILES = {
  programming: {
    key: "programming",
    label: "Programming / web development",
    allowsCode: true,
    practiceTypes: ["output-prediction", "debugging", "coding", "short-answer", "conceptual", "project"],
    guidance:
      "Use short, correct, runnable code examples with the language named. Practice should mix predicting output, finding bugs, and small coding challenges; end-of-module lessons may include a small project.",
  },
  databases: {
    key: "databases",
    label: "Databases / SQL",
    allowsCode: true,
    practiceTypes: ["sql-exercise", "schema-design", "output-prediction", "debugging", "short-answer", "conceptual", "project"],
    guidance:
      "Use SQL (or the course's database technology) with small, concrete sample tables. Include query-writing, schema design and normalization exercises where relevant.",
  },
  "math-science": {
    key: "math-science",
    label: "Mathematics / science",
    allowsCode: false,
    practiceTypes: ["calculation", "derivation", "conceptual", "short-answer"],
    guidance:
      "Give fully worked numerical problems with every step shown, units where relevant, and conceptual questions that test understanding rather than memorization.",
  },
  business: {
    key: "business",
    label: "Business / finance / management",
    allowsCode: false,
    practiceTypes: ["case-study", "scenario", "calculation", "short-answer", "reflection"],
    guidance:
      "Use realistic (clearly hypothetical) companies and numbers. Include worked calculations where the topic is quantitative, decision-making scenarios, and short case studies. Do not cite real statistics, laws or rates as current facts; describe them generally or mark them as illustrative.",
  },
  design: {
    key: "design",
    label: "Design / creative",
    allowsCode: false,
    practiceTypes: ["design-task", "critique", "short-answer", "reflection", "project"],
    guidance:
      "Describe visual examples in words (layouts, colour choices, typography decisions) and give guided design challenges and critique exercises. Later lessons may include a portfolio-style mini project.",
  },
  music: {
    key: "music",
    label: "Music / instruments",
    allowsCode: false,
    practiceTypes: ["technique-drill", "listening-task", "theory-exercise", "short-answer", "reflection"],
    guidance:
      "Explain technique step by step (posture, fingering, timing), use simple notation or tab described in text, and give practice drills with tempo targets and listening tasks. Never include programming.",
  },
  general: {
    key: "general",
    label: "General",
    allowsCode: false,
    practiceTypes: ["short-answer", "conceptual", "scenario", "reflection"],
    guidance: "Use concrete, everyday examples and exercises that apply the lesson's ideas.",
  },
};

const KEYWORDS = [
  { profile: "databases", pattern: /\b(sql|mysql|postgres(ql)?|sqlite|mongodb|database|databases|oracle db|nosql|data ?modeling)\b/i },
  { profile: "math-science", pattern: /\b(math|mathematics|calculus|algebra|geometry|trigonometry|statistics|probability|physics|chemistry|biology)\b/i },
  { profile: "programming", pattern: /\b(programming|coding|code|javascript|typescript|python|java|php|ruby|html5?|css3?|react|angular|vue|node(\.?js)?|django|laravel|wordpress|jquery|bootstrap|api|developer|web development|c\+\+|c#|swift|kotlin|git)\b/i },
  { profile: "music", pattern: /\b(guitar|piano|ukulele|violin|drums?|harmonica|bass|singing|vocal|music theory|chords?|keyboard)\b/i },
  { profile: "design", pattern: /\b(design|photoshop|illustrator|indesign|typography|logo|branding|ui|ux|figma|drawing|illustration|graphic)\b/i },
  { profile: "business", pattern: /\b(finance|accounting|trading|forex|stock|invest(ing|ment)?|business|marketing|management|economics|tax|gst|excel|bookkeeping|startup)\b/i },
];

const CATEGORY_DEFAULTS = {
  "web development": "programming",
  "business finance": "business",
  "graphic design": "design",
  "musical instruments": "music",
  programming: "programming",
};

const detectSubjectProfile = (course) => {
  const text = [course?.courseName, course?.description, ...(course?.skills || [])].filter(Boolean).join(" ");
  const category = String(course?.category || "").trim().toLowerCase();

  // A strong title keyword wins first for databases/maths (narrow, distinctive
  // subjects); otherwise the catalog category decides, falling back to
  // keywords for uncategorized courses.
  for (const { profile, pattern } of KEYWORDS.slice(0, 2)) {
    if (pattern.test(text)) return PROFILES[profile];
  }

  if (CATEGORY_DEFAULTS[category]) {
    // A music or design course sitting in a code-heavy category (or vice
    // versa) should still get the right activities.
    const fromCategory = CATEGORY_DEFAULTS[category];
    if (fromCategory !== "programming") return PROFILES[fromCategory];
    return PROFILES.programming;
  }

  for (const { profile, pattern } of KEYWORDS) {
    if (pattern.test(text)) return PROFILES[profile];
  }

  return PROFILES.general;
};

module.exports = { PROFILES, PRACTICE_TYPES, detectSubjectProfile };
