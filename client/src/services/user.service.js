import api from './api';

// Get the current user's profile
const getMe = () => {
  return api.get('/users/me');
};

// Update the user's profile
const updateUser = (userData) => {
  // userData should be an object like { name: "New Name", about: "New About" }
  return api.put('/users/me', userData);
};

// Search for other users
const searchUsers = (query) => {
  return api.get(`/users/search?q=${query}`);
};

const userService = {
  getMe,
  updateUser,
  searchUsers,
};

export default userService;