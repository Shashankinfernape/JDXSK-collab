import axios from 'axios';

// Set up a base instance of Axios
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Your server's API URL
});

// This "interceptor" runs before every request.
// It grabs the token from localStorage and adds it to the headers.
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