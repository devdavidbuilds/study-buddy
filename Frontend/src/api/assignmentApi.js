import API from './api';

// Faculty: create an assignment for a course/module/lesson
export const createAssignment = (data) =>
  API.post('/assignments/create', data);

// Faculty: get all assignments created by the logged-in faculty
export const getMyAssignments = () =>
  API.get('/assignments/my');

// Get all assignments for a specific course
export const getAssignmentsByCourse = (courseId) =>
  API.get(`/assignments/course/${courseId}`);

// Get assignment(s) for a specific module/lesson within a course
// (used by the student assignment flow)
export const getAssignmentsForLesson = (courseId, moduleId, lessonId) =>
  API.get(`/assignments/course/${courseId}/module/${moduleId}/lesson/${lessonId}`);

// Faculty: get all student submissions for an assignment
// (only assignments belonging to the faculty's own courses — enforced server-side)
export const getSubmissionsForAssignment = (assignmentId) =>
  API.get(`/assignments/${assignmentId}/submissions`);

// Faculty: save marks + feedback for a student's submission
export const evaluateSubmission = (assignmentId, studentId, { marks, feedback }) =>
  API.put(`/assignments/${assignmentId}/submissions/${studentId}/evaluate`, {
    marks,
    feedback,
  });
