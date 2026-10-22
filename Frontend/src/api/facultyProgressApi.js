import API from './api';

// Faculty: course-level progress analytics + student list, for a
// course the logged-in faculty owns (enforced server-side).
export const getCourseProgressOverview = (courseId) =>
  API.get(`/faculty/courses/${courseId}/progress`);

// Faculty: a single student's detailed progress within a course the
// logged-in faculty owns (enforced server-side).
export const getStudentProgressDetail = (courseId, studentId) =>
  API.get(`/faculty/courses/${courseId}/students/${studentId}/progress`);

// Faculty dashboard figures across all of the faculty member's courses:
// students, published assignments, average completion, recent activity.
export const getFacultyOverview = () => API.get('/faculty/courses/overview');
