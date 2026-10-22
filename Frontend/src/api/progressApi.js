import API from './api';

// Get the authenticated student's progress for a course
// (completed lessons + assignment submissions), scoped to the logged-in user.
export const getCourseProgress = (courseId) =>
  API.get(`/progress/${courseId}`);

// Mark a lesson complete for the authenticated student.
export const markLessonComplete = (courseId, { moduleId, lessonId }) =>
  API.post(`/progress/${courseId}/complete`, { moduleId, lessonId });

// Submit a lesson's built-in check; answers are option indexes and the
// server returns the score, correct options and explanations.
export const submitLessonCheck = (courseId, { moduleId, lessonId, answers }) =>
  API.post(`/progress/${courseId}/lesson-check`, { moduleId, lessonId, answers });

// Submit (or resubmit) an assignment for a lesson.
// - Real, faculty-created assignment: pass { assignmentId, answers } (array, one per question).
// - Legacy auto-generated lesson prompt: pass { title, answer } (free text).
// - Either flow may attach one PDF as `file` (sent as multipart/form-data);
//   onUploadProgress receives a 0-100 percentage.
export const submitAssignment = (
  courseId,
  { moduleId, lessonId, title, answer, assignmentId, answers, file },
  { onUploadProgress } = {}
) => {
  if (!file) {
    return API.post(`/progress/${courseId}/submit`, {
      moduleId,
      lessonId,
      title,
      answer,
      assignmentId,
      answers,
    });
  }

  const form = new FormData();
  form.append('moduleId', moduleId);
  form.append('lessonId', lessonId);
  if (title) form.append('title', title);
  if (answer) form.append('answer', answer);
  if (assignmentId) form.append('assignmentId', assignmentId);
  if (answers) form.append('answers', JSON.stringify(answers));
  form.append('file', file);

  return API.post(`/progress/${courseId}/submit`, form, {
    onUploadProgress: (event) => {
      if (onUploadProgress && event.total) {
        onUploadProgress(Math.round((event.loaded / event.total) * 100));
      }
    },
  });
};

// Student: all of their own submissions (status, PDF, marks, feedback)
export const getMySubmissions = () => API.get('/progress/submissions/mine');

// Student: dashboard summary — courses, streak, XP/level, weekly and monthly
// activity, upcoming assignments, goals, badges and leaderboard. tz lets the
// server count days (streak, "today") in the student's local time.
export const getLearningSummary = () =>
  API.get('/progress/summary', { params: { tz: new Date().getTimezoneOffset() } });
