import API from './api';

export const getCourses = (params = {}) =>
  API.get('/courses', { params });

export const getCourse = (id) => API.get(`/courses/${id}`);

export const createCourse = (data) => API.post('/courses/create', data);