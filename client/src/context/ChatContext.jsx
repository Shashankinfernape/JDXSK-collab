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
  
  // --- New State for Selection & Reply ---
  const [selectedMessages, setSelectedMessages] = useState([]); // Array of message IDs
  const [replyingTo, setReplyingTo] = useState(null); // Message object

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?._id]); 

  // --- UPDATED Socket Listeners useEffect ---
  useEffect(() => {
    if (!socket) return;

    socket.on('receiveMessage', (message) => {
      setMessages(prev => {
        const chatId = message.chatId;
        const currentMessages = prev[chatId] || [];
        
        // STRICT Deduplication: If ID exists, ignore completely
        if (currentMessages.some(m => m._id === message._id)) {
            return prev;
        }

        // Robust Sender Check
        const msgSenderId = message.senderId?._id || message.senderId;
        const isMyMessage = user && msgSenderId && msgSenderId.toString() === user._id.toString();
        
        if (isMyMessage) {
            // Find specific temp message by content match (more accurate)
            const tempIndex = currentMessages.findIndex(m => 
                m._id.toString().startsWith('temp-') && m.content === message.content
            );
            
            if (tempIndex !== -1) {
                const updatedMessages = [...currentMessages];
                updatedMessages[tempIndex] = message;
                return {
                    ...prev,
                    [chatId]: updatedMessages
                };
            }
        }
        
        // Deduplication check
        if (currentMessages.some(m => m._id === message._id)) {
            return prev;
        }

        return {
          ...prev,
          [chatId]: [...currentMessages, message],
        };
      });
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
  }, [socket, user]); // Added user to dependencies

  // --- UPDATED selectChat ---
  // We'll add logic to mark messages as read when a chat is opened
  const selectChat = async (chat) => {
    let fullChat = chat;
    setActiveChat(fullChat); 
    clearSelection(); // Clear selection when changing chat
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
  const sendMessage = async (text) => {
    if (!activeChat || !user) return; // Socket check not strictly required for REST, but good for online status
    
    const messageData = {
      chatId: activeChat._id,
      senderId: user._id, 
      content: text,
      replyTo: replyingTo ? { _id: replyingTo._id, content: replyingTo.content, senderName: replyingTo.senderId.name } : null
    };

    // 1. Optimistic UI Update
    const optimisticMessage = {
      ...messageData,
      _id: `temp-${Math.random()}`, // Temporary ID
      createdAt: new Date().toISOString(),
      senderId: { 
        _id: user._id, 
        name: user.name,
        profilePic: user.profilePic,
      },
      // We need to match the structure for replyingTo if present
      replyTo: replyingTo ? replyingTo : null 
    };

    setMessages(prev => ({
      ...prev,
      [activeChat._id]: [...(prev[activeChat._id] || []), optimisticMessage],
    }));
    setReplyingTo(null); 

    // 2. Reliable REST API Call
    try {
        // We use POST /messages instead of socket.emit
        // The server will save to DB AND emit 'receiveMessage' via socket
        const { data: savedMessage } = await api.post('/messages', {
            chatId: activeChat._id,
            content: text,
            replyTo: replyingTo ? replyingTo._id : null
        });
        
        // 3. Reconcile Optimistic Message (Optional but good)
        // The socket listener 'receiveMessage' will likely handle this replacement 
        // via the deduplication logic we added earlier (temp- ID check).
        // But we can also manually replace it here if socket is slow.
        setMessages(prev => {
            const currentMessages = prev[activeChat._id] || [];
            const tempIndex = currentMessages.findIndex(m => m._id === optimisticMessage._id);
            if (tempIndex !== -1) {
                const updated = [...currentMessages];
                updated[tempIndex] = savedMessage;
                return { ...prev, [activeChat._id]: updated };
            }
            return prev;
        });

    } catch (error) {
        console.error("Failed to send message via API", error);
        // TODO: Mark message as failed in UI
    }
  };

  const sendFileMessage = async (file, duration = 0) => {
      if (!activeChat || !user) return;
      
      // 1. Log Upload Start (No Optimistic UI for Files to prevent dupes)
      console.log("Uploading file...", file.type, file.size);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('chatId', activeChat._id);
      if (duration) formData.append('duration', duration);

      try {
          const { data: newMessage } = await api.post('/messages/upload', formData, {
              headers: { 'Content-Type': 'multipart/form-data' }
          });
          
          // Socket emit NO LONGER NEEDED (Server emits on upload)
          // socket.emit('sendMessage', newMessage); 
          
          // Add REAL message directly (Dedup logic in setMessages will handle race with socket)
          setMessages(prev => {
              const chatMessages = prev[activeChat._id] || [];
              if (chatMessages.some(m => m._id === newMessage._id)) return prev; // Already added by socket?
              return { 
                  ...prev, 
                  [activeChat._id]: [...chatMessages, newMessage] 
              };
          });
      } catch (error) {
          console.error("Failed to send file", error);
          // Show error toast or alert here if needed
      }
  };

  const sendMessageToChat = React.useCallback(async (targetChatId, text) => {
      console.log("sendMessageToChat called (REST):", { targetChatId, text, user: !!user });
      if (!user) {
          console.warn("Cannot send message: User missing");
          return;
      }

      // Optimistic Update if we are in that chat
      // (Moved up for immediate feedback)
      let tempId = `temp-${Math.random()}`;
      if (activeChat && activeChat._id === targetChatId) {
          const optimisticMessage = {
              chatId: targetChatId,
              senderId: { 
                  _id: user._id, 
                  name: user.name,
                  profilePic: user.profilePic,
              },
              content: text,
              createdAt: new Date().toISOString(),
              _id: tempId,
              replyTo: null 
          };
          setMessages(prev => ({
              ...prev,
              [targetChatId]: [...(prev[targetChatId] || []), optimisticMessage],
          }));
      }

      try {
           await api.post('/messages', {
              chatId: targetChatId,
              content: text,
              replyTo: null 
           });
           // Success! Socket will deliver the real message.
      } catch(e) {
          console.error("VoiceAssistant Send Failed:", e);
      }

  }, [user, activeChat]); // Removed socket dependency
  
  const deleteMessage = async (messageIds) => {
      // Optimistic Update
      setMessages(prev => {
          const chatId = activeChat._id;
          const currentMessages = prev[chatId] || [];
          const updatedMessages = currentMessages.filter(msg => !messageIds.includes(msg._id));
          return { ...prev, [chatId]: updatedMessages };
      });
      clearSelection();

      // Server Call (Fire and forget style for UX speed, or handle error revert)
      try {
          // Assuming backend supports array or loop. For now, loop safe.
          await Promise.all(messageIds.map(id => api.delete(`/messages/${id}`)));
      } catch (e) {
          console.error("Failed to delete messages", e);
          // Ideally revert state here, but simple for now
      }
  };
  
  const addNewChat = (chat) => {
     setChats(prev => {
       if (prev.find(c => c._id === chat._id)) {
         return prev;
       }
       return [chat, ...prev];
     });
  }

  // --- Selection Helpers ---
  const toggleMessageSelection = (messageId) => {
      setSelectedMessages(prev => {
          if (prev.includes(messageId)) {
              return prev.filter(id => id !== messageId);
          } else {
              return [...prev, messageId];
          }
      });
  };

  const clearSelection = () => {
      setSelectedMessages([]);
  };

  const value = {
    chats,
    activeChat,
    messages: messages[activeChat?._id] || [],
    onlineUsers,
    loading,
    selectChat,
    sendMessage,
    sendFileMessage, // Exported
    sendMessageToChat, // Exposed for Forwarding
    deleteMessage, 
    addNewChat, 
    // New Context Values
    selectedMessages,
    isSelectionMode: selectedMessages.length > 0,
    toggleMessageSelection,
    clearSelection,
    replyingTo,
    setReplyingTo,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};