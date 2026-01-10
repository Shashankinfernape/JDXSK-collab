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

const sendFriendRequest = (recipientId) => {
  return api.post(`/users/friend-request/${recipientId}`);
};

const acceptFriendRequest = (requestId) => {
  return api.put(`/users/friend-request/${requestId}/accept`);
};

const rejectFriendRequest = (requestId) => {
  return api.put(`/users/friend-request/${requestId}/reject`);
};

const getNotifications = () => {
  return api.get('/users/notifications');
};

const getFriends = () => {
  return api.get('/users/friends');
};

const userService = {
  getMe,
  updateUser,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getNotifications,
  getFriends
};

export default userService;