import api from './api';

export const createFaculty = (data) => api.post('/admin/faculty', data);

export const getAdminOverview = () => api.get('/admin/overview');

export const getFacultyList = (params) => api.get('/admin/faculty', { params });

export const getAdminStudents = (params) => api.get('/admin/students', { params });

export const getAdminCourseRatings = (params) => api.get('/admin/course-ratings', { params });

// Global Announcements
export const createAnnouncement = (data) => api.post('/admin/announcements', data);

export const getAnnouncements = (params) => api.get('/admin/announcements', { params });

export const deleteAnnouncement = (id) => api.delete(`/admin/announcements/${id}`);

export const togglePinAnnouncement = (id) => api.patch(`/admin/announcements/${id}/pin`);
