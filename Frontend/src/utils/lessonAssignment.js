// ========================================
// STUDY BUDDY – LESSON LEARNING HELPERS
// ========================================
//
// The imported course dataset only contains course-level metadata and a
// lecture count — not the original lecture-by-lecture material. Each lesson
// already stores its own original `description` / `content` (written when
// the course was imported). These helpers derive a reading summary and an
// original assignment prompt from that existing lesson data — nothing here
// is copied from Udemy/NPTEL or any external source.

// Split a lesson's content into short "key concept" bullets.
export function getKeyConcepts(lesson, max = 4) {
  const text = (lesson?.content || lesson?.description || '').trim();
  if (!text) return [];

  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 12);

  return sentences.slice(0, max);
}

// The lesson's stated objective (falls back to a generic objective).
export function getLessonObjective(lesson) {
  return (
    lesson?.description ||
    'Understand the core idea of this lesson and be ready to apply it.'
  );
}

// Build an original, lesson-specific assignment prompt.
export function buildAssignment(course, module, lesson) {
  const subject =
    course?.category || course?.courseName || course?.title || 'this subject';
  const title = lesson?.title || 'this lesson';
  const moduleTitle = module?.title || '';

  return {
    instructions:
      'Write a short, original response in your own words. There is no single "correct" answer — this checks that you understood the lesson, not that you memorized it.',
    question: `In 120–250 words, explain "${title}" in your own words${
      moduleTitle ? ` as it relates to ${moduleTitle}` : ''
    }, and describe one practical example of how it applies within ${subject}.`,
    maxMarks: 10,
  };
}
