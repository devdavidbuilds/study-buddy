import api from './api';

export const createFaculty = (data) => api.post('/api/admin/faculty', data);

export const getAdminOverview = () => api.get('/api/admin/overview');

export const getFacultyList = (params) => api.get('/api/admin/faculty', { params });

export const getAdminStudents = (params) => api.get('/api/admin/students', { params });

export const getAdminCourseRatings = (params) => api.get('/api/admin/course-ratings', { params });
