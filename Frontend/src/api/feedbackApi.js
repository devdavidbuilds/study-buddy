import API from './api';

// Course feedback (rating, comment, aspects). sort: recent|helpful|high|low
export const getCourseFeedback = (courseId, sort = 'recent') =>
  API.get(`/feedback/course/${courseId}`, { params: { sort } });

// Student: create or update their own feedback (needs an approved enrollment).
export const saveMyFeedback = (courseId, { rating, comment, aspects }) =>
  API.put(`/feedback/course/${courseId}`, { rating, comment, aspects });

export const deleteMyFeedback = (courseId) => API.delete(`/feedback/course/${courseId}`);

// Student: toggle "helpful" on someone else's feedback.
export const toggleFeedbackHelpful = (id) => API.post(`/feedback/${id}/helpful`);

// Faculty/admin: feedback on their courses. params: { status, rating, courseId }
export const getFacultyFeedback = (params = {}) => API.get('/feedback/faculty', { params });

export const replyToFeedback = (id, text) => API.put(`/feedback/${id}/reply`, { text });

export const deleteFeedbackReply = (id) => API.delete(`/feedback/${id}/reply`);
