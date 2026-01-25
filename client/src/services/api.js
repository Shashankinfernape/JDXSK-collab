import axios from 'axios';

// --- API URL Configuration ---
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const BASE_URL = isLocal ? "http://localhost:5000" : "https://jdxsk-collab.onrender.com";

// Set up a base instance of Axios
const api = axios.create({
  baseURL: `${BASE_URL}/api`,
});
// --- END API URL Configuration ---

// Interceptor to add the user token to all requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
