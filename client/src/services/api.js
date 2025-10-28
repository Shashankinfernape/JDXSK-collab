import axios from 'axios';

// --- FINAL HARDCODE FIX ---
const RENDER_API_URL = "https://jdxsk-collab.onrender.com"; 

// Set up a base instance of Axios
const api = axios.create({
  baseURL: `${RENDER_API_URL}/api`,
});
// --- END HARDCODE FIX ---

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
