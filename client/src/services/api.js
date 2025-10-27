import axios from 'axios';

// --- HARDCODE FIX ---
// The live app must use the Render server for API calls
const RENDER_API_URL = "https://jdxsk-collab.onrender.com"; 

// Set up a base instance of Axios
const api = axios.create({
  baseURL: `${RENDER_API_URL}/api`,
});
// --- END HARDCODE FIX ---

// This "interceptor" runs before every request.
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
