import API from './api';

// ML course recommendations (TF-IDF + cosine similarity, see /ml).
// params: { q?: search text, courseId?: similar to this course, limit?: 1-10 }
export const getRecommendations = (params = {}) =>
  API.get('/recommendations', { params });
