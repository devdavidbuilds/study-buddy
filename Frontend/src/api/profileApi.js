import API from './api';

export const getProfile = () => API.get('/auth/profile');

export const updateProfile = (data) => API.put('/auth/profile', data);
