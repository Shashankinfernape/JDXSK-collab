const Message = require('../models/message.model');
const Chat = require('../models/chat.model');
const { getIo, getSocketId } = require('../socket/socket');
const path = require('path');

// Send Text Message (REST API)
const sendMessage = async (req, res) => {
    try {
        const { chatId, content, replyTo } = req.body;
        const senderId = req.user._id;

        if (!chatId || !content) {
             return res.status(400).json({ message: "ChatId and content are required" });
        }

        const chatDoc = await Chat.findById(chatId);
        if (!chatDoc) {
            return res.status(404).json({ message: "Chat not found" });
        }

        let disappearAt = null;
        if (chatDoc.disappearingMessages) {
            disappearAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        const newMessage = await Message.create({
            chatId,
            senderId,
            content,
            contentType: 'text',
            replyTo: replyTo || null,
            disappearAt
        });

        await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

        const populatedMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'name profilePic email')
            .populate('replyTo', 'content senderId'); // Populate reply if needed

        // --- Real-time Socket Emits ---
        try {
            const io = getIo();
            
            chatDoc.participants.forEach(participantId => {
                const socketId = getSocketId(participantId.toString());
                if (socketId) {
                    // Send to everyone (sender + recipient)
                    io.to(socketId).emit('receiveMessage', populatedMessage);
                    io.to(socketId).emit('updateChatList', populatedMessage);
                    
                    // Delivery Receipt Logic (for Recipient)
                    if (participantId.toString() !== senderId.toString()) {
                         Message.findByIdAndUpdate(newMessage._id, 
                             { $addToSet: { deliveredTo: participantId } }
                         ).then(updatedMsg => {
                             const senderSocketId = getSocketId(senderId.toString());
                             if (senderSocketId) {
                                 io.to(senderSocketId).emit('messageDelivered', { 
                                     messageId: newMessage._id, 
                                     chatId: chatId,
                                     deliveredTo: participantId 
                                 });
                             }
                         });
                    }
                }
            });
        } catch (socketError) {
            console.error("Socket emit failed in controller (non-fatal):", socketError);
        }

        res.status(201).json(populatedMessage);
    } catch (error) {
        console.error("SendMessage Error:", error);
        res.status(500).json({ message: error.message });
    }
};

// Upload Message (Image/Audio)
const uploadMessage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { chatId, duration, replyTo } = req.body;
        const senderId = req.user._id;

        if (!chatId) {
            return res.status(400).json({ message: "ChatId is required" });
        }

        const chatDoc = await Chat.findById(chatId);
        if (!chatDoc) {
            return res.status(404).json({ message: "Chat not found" });
        }
        
        // Robust Mimetype/Extension Check
        // Some mobile browsers or recorders might send different mimetypes
        const mimetype = req.file.mimetype.toLowerCase();
        const extension = path.extname(req.file.originalname).toLowerCase();
        
        const isAudio = 
            mimetype.startsWith('audio/') || 
            mimetype === 'video/webm' || 
            mimetype === 'video/ogg' ||
            mimetype === 'application/octet-stream' ||
            ['.webm', '.mp3', '.wav', '.m4a', '.ogg', '.aac'].includes(extension);

        const type = isAudio ? 'audio' : 'image';
        
        // Construct public URL
        const fileUrl = `/uploads/${req.file.filename}`;

        let disappearAt = null;
        if (chatDoc.disappearingMessages) {
            disappearAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        // Parse replyTo if it's a string (multipart/form-data often sends JSON as string)
        let parsedReplyTo = null;
        if (replyTo) {
            try {
                parsedReplyTo = typeof replyTo === 'string' ? JSON.parse(replyTo) : replyTo;
            } catch (e) {
                console.error("Error parsing replyTo in uploadMessage:", e);
            }
        }

        const newMessage = await Message.create({
            chatId,
            senderId,
            content: type === 'audio' ? '🎤 Voice Message' : '📷 Image',
            contentType: type,
            fileUrl: fileUrl,
            duration: duration ? Number(duration) : 0,
            replyTo: parsedReplyTo,
            disappearAt: disappearAt
        });

        // Optimization: Only populate sender fields, no need to populate full chatId
        const fullMessage = await newMessage.populate('senderId', 'name profilePic email');

        await Chat.findByIdAndUpdate(chatId, { 
            lastMessage: newMessage._id,
            updatedAt: new Date() // Ensure chat list updates position
        });
        
        // --- Socket Logic for File Uploads ---
        try {
            const io = getIo();
            chatDoc.participants.forEach(participantId => {
                const socketId = getSocketId(participantId.toString());
                if (socketId) {
                    io.to(socketId).emit('receiveMessage', fullMessage);
                    io.to(socketId).emit('updateChatList', fullMessage);
                    
                    // Delivery Receipt Logic (for Recipient)
                    if (participantId.toString() !== senderId.toString()) {
                         Message.findByIdAndUpdate(newMessage._id, 
                             { $addToSet: { deliveredTo: participantId } }
                         ).catch(err => console.error("Error updating deliveredTo for file:", err));
                    }
                }
            });
        } catch (socketError) {
            console.error("Socket emit failed on upload (non-fatal):", socketError);
        }

        res.status(201).json(fullMessage);
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    sendMessage,
    uploadMessage,
};