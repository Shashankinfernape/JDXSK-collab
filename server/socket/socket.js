const Message = require('../models/message.model');
const Chat = require('../models/chat.model');
const User = require('../models/user.model'); // Import User model

const userSocketMap = new Map();
let ioInstance; 

function initSocket(io) {
  ioInstance = io; 

  io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId) {
      console.log(`User ${userId} connected with socket ${socket.id}`);
      userSocketMap.set(userId, socket.id);
      io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));

      // Set user's lastSeen to null (or just don't update it)
      // When they connect, they are "online", not "last seen"
    }

    socket.on('joinRoom', (chatId) => {
      socket.join(chatId);
      console.log(`Socket ${socket.id} joined room ${chatId}`);
    });

    socket.on('leaveRoom', (chatId) => {
      socket.leave(chatId);
      console.log(`Socket ${socket.id} left room ${chatId}`);
    });

    // --- UPDATED sendMessage ---
    socket.on('sendMessage', async (messageData) => {
      try {
        const newMessage = new Message({
          chatId: messageData.chatId,
          senderId: messageData.senderId,
          content: messageData.content,
          contentType: 'text',
          replyTo: messageData.replyTo, // Save reply context
          // Set the message to disappear in 2 days (48 hours)
          disappearAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)
        });
        const savedMessage = await newMessage.save();

        await Chat.findByIdAndUpdate(messageData.chatId, {
          lastMessage: savedMessage._id
        });

        const populatedMessage = await savedMessage.populate('senderId', 'name profilePic');
        
        const chat = await Chat.findById(messageData.chatId);
        
        chat.participants.forEach(participantId => {
            const socketId = userSocketMap.get(participantId.toString());
            
            if (socketId) {
              if (participantId.toString() === messageData.senderId) {
                // SENDER: Receive confirmation (to replace temp ID) + update list
                io.to(socketId).emit('receiveMessage', populatedMessage);
                io.to(socketId).emit('updateChatList', populatedMessage);
              } else {
                // RECIPIENT: Receive message, update list, and send delivery receipt
                io.to(socketId).emit('receiveMessage', populatedMessage);
                io.to(socketId).emit('updateChatList', populatedMessage);
                
                // --- NEW: Emit messageDelivered event ---
                // We update the DB first
                Message.findByIdAndUpdate(savedMessage._id, 
                  { $addToSet: { deliveredTo: participantId } },
                  { new: true } // Return the updated doc
                ).then(updatedMsg => {
                  // Now notify the sender that it was delivered
                  const senderSocketId = userSocketMap.get(messageData.senderId);
                  if (senderSocketId) {
                    io.to(senderSocketId).emit('messageDelivered', { 
                      messageId: updatedMsg._id, 
                      chatId: updatedMsg.chatId,
                      deliveredTo: participantId 
                    });
                  }
                });
              }
            }
        });

      } catch (error) {
        console.error('Error sending message:', error);
      }
    });
    
    // --- UPDATED messageRead ---
    // This event is now triggered by the client when they *see* a message
    socket.on('messageRead', async ({ messageId, chatId }) => {
       try {
         const message = await Message.findByIdAndUpdate(messageId, 
           { $addToSet: { readBy: userId } }, // Add current user to readBy
           { new: true }
         );

         if (message) {
            // Notify the SENDER that their message was read
            const senderSocketId = userSocketMap.get(message.senderId.toString());
            if (senderSocketId) {
              io.to(senderSocketId).emit('messageReadByRecipient', {
                messageId: message._id,
                chatId: message.chatId,
                readBy: userId
              });
            }
         }
       } catch (error) {
         console.error('Error marking message as read:', error);
       }
    });

    // --- UPDATED disconnect ---
    socket.on('disconnect', async () => { // Make this async
      console.log(`Socket disconnected: ${socket.id}`);
      let disconnectedUserId;
      for (let [key, value] of userSocketMap.entries()) {
        if (value === socket.id) {
          disconnectedUserId = key;
          userSocketMap.delete(key);
          break;
        }
      }
      
      if (disconnectedUserId) {
        // Update the list of online users
        io.emit('getOnlineUsers', Array.from(userSocketMap.keys()));
        
        // --- NEW: Update 'lastSeen' in the database ---
        try {
          await User.findByIdAndUpdate(disconnectedUserId, { lastSeen: new Date() });
          console.log(`Updated lastSeen for user ${disconnectedUserId}`);
        } catch (error) {
          console.error('Error updating lastSeen:', error);
        }
      }
    });
    
    // (Other listeners like 'typing' are unchanged)
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(chatId).emit('typing', { isTyping });
    });
  });
}

function getIo() {
  if (!ioInstance) {
    throw new Error("Socket.IO not initialized!");
  }
  return ioInstance;
}

function getSocketId(userId) {
  return userSocketMap.get(userId);
}

module.exports = {
  initSocket,
  getIo,
  getSocketId,
};