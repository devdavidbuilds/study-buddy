import API from './api';

// Get the authenticated student's progress for a course
// (completed lessons + assignment submissions), scoped to the logged-in user.
export const getCourseProgress = (courseId) =>
  API.get(`/progress/${courseId}`);

// Mark a lesson complete for the authenticated student.
export const markLessonComplete = (courseId, { moduleId, lessonId }) =>
  API.post(`/progress/${courseId}/complete`, { moduleId, lessonId });

// Submit (or resubmit) an assignment for a lesson.
// - Real, faculty-created assignment: pass { assignmentId, answers } (array, one per question).
// - Legacy auto-generated lesson prompt: pass { title, answer } (free text).
export const submitAssignment = (
  courseId,
  { moduleId, lessonId, title, answer, assignmentId, answers }
) =>
  API.post(`/progress/${courseId}/submit`, {
    moduleId,
    lessonId,
    title,
    answer,
    assignmentId,
    answers,
  });
