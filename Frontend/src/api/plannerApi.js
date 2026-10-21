import API from './api';

// Study sessions between two calendar days (inclusive), as YYYY-MM-DD.
export const getStudySessions = (from, to) =>
  API.get('/planner/sessions', { params: { from, to } });

// data: { courseId, date, startTime, durationMinutes, title?, notes?, repeatWeeks? }
export const createStudySession = (data) => API.post('/planner/sessions', data);

export const updateStudySession = (id, data) =>
  API.patch(`/planner/sessions/${id}`, data);

export const deleteStudySession = (id) => API.delete(`/planner/sessions/${id}`);

export const getStudyGoals = () => API.get('/planner/goals');

// weeklyMinutes = 0 removes the goal.
export const setStudyGoal = (courseId, weeklyMinutes) =>
  API.put(`/planner/goals/${courseId}`, { weeklyMinutes });
