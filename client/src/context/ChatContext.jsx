// ... (imports are the same)
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import api from '../services/api'; 

const ChatContext = createContext();

export const useChat = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState({}); 
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const { socket } = useSocket(); // Fix: destructure socket
  const { user } = useAuth();

  // ... (useEffect for fetchChats is unchanged) ...
  useEffect(() => {
    if (!user) return; 
    const fetchChats = async () => {
      setLoading(true);
      try {
        const { data: chatData } = await api.get('/chats');
        setChats(chatData);
      } catch (error) {
        console.error("Failed to fetch chats", error);
      }
      setLoading(false);
    };
    fetchChats();
  }, [user]); 

  // --- UPDATED Socket Listeners useEffect ---
  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (message) => {
      console.log('Socket: Received message', message);
      setMessages(prev => ({
        ...prev,
        [message.chatId]: [...(prev[message.chatId] || []), message],
      }));
    });
    
    socket.on('updateChatList', (lastMessage) => {
        setChats(prevChats => 
          prevChats.map(chat =>
            chat._id === lastMessage.chatId
              ? { ...chat, lastMessage: lastMessage }
              : chat
          ).sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0))
        );
    });

    socket.on('newChat', (newChat) => {
      console.log('Socket: Received new chat', newChat);
      setChats(prev => {
        if (!prev.find(chat => chat._id === newChat._id)) {
          return [newChat, ...prev]; 
        }
        return prev;
      });
    });

    socket.on('getOnlineUsers', (users) => {
      setOnlineUsers(users);
    });

    // --- NEW: Listener for Delivery Receipt ---
    socket.on('messageDelivered', ({ messageId, chatId, deliveredTo }) => {
      setMessages(prev => {
        const chatMessages = (prev[chatId] || []).map(msg => 
          msg._id === messageId 
            ? { ...msg, deliveredTo: [...(msg.deliveredTo || []), deliveredTo] } 
            : msg
        );
        return { ...prev, [chatId]: chatMessages };
      });
    });

    // --- NEW: Listener for Read Receipt ---
    socket.on('messageReadByRecipient', ({ messageId, chatId, readBy }) => {
      setMessages(prev => {
        const chatMessages = (prev[chatId] || []).map(msg =>
          msg._id === messageId
            ? { ...msg, readBy: [...(msg.readBy || []), readBy] }
            : msg
        );
        return { ...prev, [chatId]: chatMessages };
      });
    });

    // --- NEW: Listener for Friend Request Accepted ---
    socket.on('friendRequestAccepted', async (newFriend) => {
        console.log("Friend Request Accepted by:", newFriend);
        // We want to ensure a chat exists or just add them to the list if the UI supports "Contacts"
        // But for "ChatList", we typically need a chat object.
        // Let's try to fetch or create the chat with this user
        try {
             // We can optimistically create a "fake" chat object or call API
             const { data: newChat } = await api.post('/chats', { recipientId: newFriend._id });
             addNewChat(newChat);
        } catch(e) {
            console.error("Failed to create chat on friend accept", e);
        }
    });

    return () => {
      socket.off('receiveMessage');
      socket.off('getOnlineUsers');
      socket.off('newChat'); 
      socket.off('updateChatList'); 
      socket.off('messageDelivered'); 
      socket.off('messageReadByRecipient');
      socket.off('friendRequestAccepted'); // Clean up
    };
  }, [socket]);

  // --- UPDATED selectChat ---
  // We'll add logic to mark messages as read when a chat is opened
  const selectChat = async (chat) => {
    let fullChat = chat;
    setActiveChat(fullChat); 
    socket.emit('joinRoom', fullChat._id);
    
    let messageData = messages[fullChat._id];

    if (!messageData) {
      try {
        const { data } = await api.get(`/chats/${fullChat._id}/messages`);
        messageData = data;
        setMessages(prev => ({ ...prev, [fullChat._id]: messageData }));
      } catch (error) {
        console.error("Failed to fetch messages for chat", error);
      }
    }
    
    // --- NEW: Mark messages as read ---
    if (messageData) {
      messageData.forEach(msg => {
        // If message is not from me and I haven't read it
        if (msg.senderId._id !== user._id && !msg.readBy?.includes(user._id)) {
          socket.emit('messageRead', { messageId: msg._id, chatId: fullChat._id });
        }
      });
    }
  };

  // ... (sendMessage and addNewChat are unchanged from the previous step) ...
  const sendMessage = (text) => {
    if (!activeChat || !user || !socket) return;
    const messageData = {
      chatId: activeChat._id,
      senderId: user._id, 
      content: text,
    };
    socket.emit('sendMessage', messageData);
    const optimisticMessage = {
      ...messageData,
      _id: `temp-${Math.random()}`,
      createdAt: new Date().toISOString(),
      senderId: { 
        _id: user._id, 
        name: user.name,
        profilePic: user.profilePic,
      }
    };
    setMessages(prev => ({
      ...prev,
      [activeChat._id]: [...(prev[activeChat._id] || []), optimisticMessage],
    }));
  };
  
  const addNewChat = (chat) => {
     setChats(prev => {
       if (prev.find(c => c._id === chat._id)) {
         return prev;
       }
       return [chat, ...prev];
     });
  }

  const value = {
    chats,
    activeChat,
    messages: messages[activeChat?._id] || [],
    onlineUsers,
    loading,
    selectChat,
    sendMessage,
    addNewChat, 
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};