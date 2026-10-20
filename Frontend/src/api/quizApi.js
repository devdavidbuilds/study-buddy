import API from './api';

// Faculty: create a quiz for a course/module/lesson they own
export const createQuiz = (data) => API.post('/quizzes/create', data);

// Faculty: get all quizzes created by the logged-in faculty
export const getMyQuizzes = () => API.get('/quizzes/my');

// Faculty: get quizzes for a course they own
export const getQuizzesByCourse = (courseId) =>
  API.get(`/quizzes/course/${courseId}`);

// Faculty: get quizzes for a specific module/lesson within a course they own
export const getQuizzesForLesson = (courseId, moduleId, lessonId) =>
  API.get(`/quizzes/course/${courseId}/module/${moduleId}/lesson/${lessonId}`);

// Student-safe quiz submission; scoring is performed by the backend.
export const submitQuiz = (courseId, quizId, data) =>
  API.post(`/quizzes/course/${courseId}/${quizId}/submit`, data);
