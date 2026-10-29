import API, { setAuthToken } from './api';

export const register = (data) => API.post('/auth/register', data);

export const login = (data) => API.post('/auth/login', data);

export const profile = () => API.get('/auth/profile');

export const logout = () => {
  setAuthToken(null);
  localStorage.removeItem('token');
  localStorage.removeItem('studyBuddyToken');
  localStorage.removeItem('studyBuddyProfile');
};
