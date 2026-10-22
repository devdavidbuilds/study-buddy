import API from './api';

// Faculty/admin: every registered student with details, login status and
// a learning summary.
export const getStudents = () => API.get('/faculty/students');

// Faculty/admin: one student's details, courses, certificates and activity.
export const getStudentDetail = (studentId) => API.get(`/faculty/students/${studentId}`);
