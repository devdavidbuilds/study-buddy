import API from './api';

export const getCourses = () => API.get('/courses');

export const getCourse = (id) => API.get(`/courses/${id}`);

export const createCourse = (data) => API.post('/courses/create', data);