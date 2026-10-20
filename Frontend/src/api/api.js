import axios from 'axios';

// Backend URL from Vercel environment variables, with Render fallback
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  'https://study-buddy-91gv.onrender.com';

const API = axios.create({
  baseURL: `${API_BASE_URL.replace(/\/+$/, '')}/api`,
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('studyBuddyToken');

  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('studyBuddyToken');
      localStorage.removeItem('studyBuddyProfile');

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  }
);

export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('studyBuddyToken', token);
  } else {
    localStorage.removeItem('studyBuddyToken');
  }
};

export const getAuthToken = () =>
  localStorage.getItem('studyBuddyToken');

export default API;