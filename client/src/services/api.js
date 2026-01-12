import axios from 'axios';

// --- API URL Configuration ---
// UNCOMMENT the line below to test with the LOCAL server (requires 'npm run dev' in server folder)
const BASE_URL = "http://localhost:5000"; 

// Default to Render Production URL
// const BASE_URL = "https://jdxsk-collab.onrender.com"; 

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
