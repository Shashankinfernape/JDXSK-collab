import api from './api';

// Fetch all of the user's chats
const getChats = () => {
  return api.get('/chats');
};

// Fetch all messages for a specific chat
const getMessages = (chatId) => {
  return api.get(`/chats/${chatId}/messages`);
};

// Create a new group chat
const createGroup = (name, participants) => {
  return api.post('/chats/group', { name, participants });
};

const chatService = {
  getChats,
  getMessages,
  createGroup,
};

export default chatService;