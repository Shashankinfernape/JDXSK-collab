import axios from 'axios';

// --- API URL Configuration ---
const isProduction = window.location.hostname.includes('onrender.com');
const BASE_URL = isProduction 
    ? "https://jdxsk-collab.onrender.com" 
    : `http://${window.location.hostname}:5000`;

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
