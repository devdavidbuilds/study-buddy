const { PRACTICE_TYPES } = require("./subjectProfiles");

// ==============================
// Duration estimation
//
// Estimated study time is derived from the lesson's actual material:
// reading length, worked examples, practice activities and the
// assessment. There are no timers — this is only displayed to students.
// ==============================

const READING_WPM = 180; // study-reading pace, slower than casual reading
const MINUTES_PER_EXAMPLE = 2;
const MINUTES_PER_QUESTION = 1;

const countWords = (value) =>
  String(value || "")
    .split(/\s+/)
    .filter(Boolean).length;

const lessonReadingWords = (learning) =>
  countWords(learning?.explanation) +
  (learning?.examples || []).reduce(
    (sum, ex) => sum + countWords(ex.scenario) + countWords((ex.steps || []).join(" ")) + countWords(ex.solution) + countWords(ex.code),
    0
  ) +
  countWords((learning?.applications || []).join(" ")) +
  countWords((learning?.mistakes || []).map((m) => `${m.mistake} ${m.fix}`).join(" ")) +
  countWords((learning?.takeaways || []).join(" ")) +
  countWords(learning?.revisionNotes);

const estimateLessonMinutes = (learning, quiz = []) => {
  const reading = lessonReadingWords(learning) / READING_WPM;
  const examples = (learning?.examples || []).length * MINUTES_PER_EXAMPLE;
  const practice = (learning?.practice || []).reduce(
    (sum, item) => sum + (PRACTICE_TYPES[item.type]?.minutes || 4),
    0
  );
  const assessment = (quiz || []).length * MINUTES_PER_QUESTION;

  const total = reading + examples + practice + assessment;
  return Math.min(120, Math.max(10, Math.round(total / 5) * 5));
};

// "45 min", "1h 20m"
const formatMinutes = (minutes) => {
  const value = Math.max(0, Math.round(minutes));
  if (value < 60) return `${value} min`;
  const hours = Math.floor(value / 60);
  const rest = value % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
};

// Course-card style duration: "6.5 hours"
const formatCourseDuration = (minutes) => {
  if (minutes < 60) return `${Math.max(1, Math.round(minutes))} min`;
  const hours = Math.round((minutes / 60) * 2) / 2;
  return `${hours} ${hours === 1 ? "hour" : "hours"}`;
};

module.exports = {
  countWords,
  lessonReadingWords,
  estimateLessonMinutes,
  formatMinutes,
  formatCourseDuration,
};
