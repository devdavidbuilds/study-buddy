import axios from 'axios';

// Backend URL: VITE_API_BASE_URL when set (Vercel sets it to Render).
// Otherwise `npm run dev` talks to the local backend, and production
// builds fall back to the Render deployment.
export const API_ORIGIN = (
  import.meta.env.VITE_API_BASE_URL ||
  (import.meta.env.DEV ? 'http://localhost:5000' : 'https://study-buddy-91gv.onrender.com')
).replace(/\/+$/, '');

const API = axios.create({
  baseURL: `${API_ORIGIN}/api`,
});

// Message for a request that never got a response (server down/unreachable).
export const unreachableMessage = () =>
  import.meta.env.DEV && API_ORIGIN.includes('localhost')
    ? `Cannot reach the backend at ${API_ORIGIN}. Start it with "npm run dev" in the Backend folder, then try again.`
    : 'Cannot reach the server right now. Please check your connection and try again in a moment.';

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