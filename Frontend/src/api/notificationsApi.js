import API from './api';

// Notifications of the logged-in user, built from real records.
export const getNotifications = () => API.get('/notifications');
