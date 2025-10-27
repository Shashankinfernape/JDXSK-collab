const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const User = require('../models/user.model');
// --- THIS IS THE FIX ---
// Import both getIo and getSocketId
const { getIo, getSocketId } = require('../socket/socket'); 
// --- END FIX ---

const getChatsForUser = async (req, res) => {
  try {
    const chats = await Chat.find({ participants: req.user._id })
      .populate('participants', 'name profilePic')
      .populate({
        path: 'lastMessage',
        populate: { path: 'senderId', select: 'name' }
      })
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createChat = async (req, res) => {
  const { recipientId } = req.body;
  if (!recipientId) {
    return res.status(400).json({ message: 'Recipient ID is required' });
  }

  try {
    const participants = [req.user._id, recipientId];

    let chat = await Chat.findOne({
      isGroup: false,
      participants: { $all: participants }
    }).populate('participants', 'name profilePic');

    if (chat) {
      return res.status(200).json(chat);
    }

    const newChat = new Chat({
      participants: participants,
    });

    let savedChat = await newChat.save();
    savedChat = await savedChat.populate('participants', 'name profilePic');
    
    // --- THIS IS THE FIX ---
    // This code block will now work correctly
    const io = getIo();
    participants.forEach(participantId => {
      const socketId = getSocketId(participantId.toString()); // This will find the socket
      if (socketId) {
        io.to(socketId).emit('newChat', savedChat); // Send the new chat data
      }
    });
    // --- END FIX ---

    res.status(201).json(savedChat);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const createGroupChat = async (req, res) => {
  const { name, participants } = req.body; 
  if (!name || !participants || participants.length < 2) {
    return res.status(400).json({ message: 'Group name and at least 2 participants are required' });
  }

  try {
    const allParticipants = [...participants, req.user._id];
    const newGroup = new Chat({
      groupName: name,
      isGroup: true,
      participants: allParticipants,
    });

    let savedGroup = await newGroup.save();
    savedGroup = await savedGroup.populate('participants', 'name profilePic');
    
    // --- THIS IS THE FIX ---
    const io = getIo();
    allParticipants.forEach(participantId => {
      const socketId = getSocketId(participantId.toString());
      if (socketId) {
        io.to(socketId).emit('newChat', savedGroup);
      }
    });
    // --- END FIX ---

    res.status(201).json(savedGroup);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMessagesForChat = async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .populate('senderId', 'name profilePic')
      .sort({ createdAt: 1 }); 

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getChatsForUser,
  createChat,
  createGroupChat,
  getMessagesForChat,
};