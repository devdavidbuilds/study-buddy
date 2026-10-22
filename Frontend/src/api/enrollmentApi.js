import API from './api';

// Student: all of their enrollments (pending / approved / rejected).
export const getMyEnrollments = () => API.get('/enrollments/mine');

// Student: their enrollment for one course ({ status: 'none' } if never asked).
export const getMyEnrollment = (courseId) => API.get(`/enrollments/course/${courseId}`);

// Student: ask to join a course; faculty of the course approve it.
export const requestEnrollment = (courseId, message = '') =>
  API.post(`/enrollments/course/${courseId}`, { message });

// Student: withdraw a pending request.
export const cancelEnrollmentRequest = (courseId) => API.delete(`/enrollments/course/${courseId}`);

// Faculty/admin: requests for their courses. status: pending|approved|rejected|all
export const getEnrollmentRequests = (status = 'pending') =>
  API.get('/enrollments/requests', { params: { status } });

// Faculty/admin: decision = 'approve' | 'reject'
export const decideEnrollment = (id, decision, note = '') =>
  API.put(`/enrollments/${id}/decision`, { decision, note });
