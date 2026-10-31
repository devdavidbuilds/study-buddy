import API from './api';

export const getCourses = (params = {}) =>
  API.get('/courses', { params });

export const getCourseDomains = () =>
  API.get('/courses/domains');

export const getCourse = (id) => API.get(`/courses/${id}`);

export const getMyFacultyCourses = () => API.get('/courses/faculty/my-courses');

export const createCourse = (data) => API.post('/courses/create', data);

// Faculty (own course) / admin: update course details and/or one lesson.
// data: { course?: {...}, moduleId?, lessonId?, lesson?: {...} }
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
