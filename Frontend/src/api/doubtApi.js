import API from './api';

export const createDoubt = (data) => API.post('/doubts', data);

export const getMyDoubts = () => API.get('/doubts/my');

export const getCourseDoubts = (courseId) => API.get(`/doubts/course/${courseId}`);

export const getFacultyDoubts = (params) => API.get('/doubts/faculty', { params });

export const replyToDoubt = (id, data) => API.put(`/doubts/${id}/reply`, data);
