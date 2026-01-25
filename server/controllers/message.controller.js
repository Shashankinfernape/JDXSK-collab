const Message = require('../models/message.model');
const Chat = require('../models/chat.model');

// Upload Message (Image/Audio)
const uploadMessage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const { chatId } = req.body;
        const senderId = req.user._id;
        
        // Determine type based on mimetype
        const type = req.file.mimetype.startsWith('audio/') ? 'audio' : 'image';
        
        // Construct public URL (assuming static serve setup)
        // In production, this would be the S3/Cloudinary URL
        const fileUrl = `/uploads/${req.file.filename}`;

        const chatDoc = await Chat.findById(chatId);
        let disappearAt = null;
        if (chatDoc && chatDoc.disappearingMessages) {
            disappearAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        }

        const newMessage = await Message.create({
            chatId,
            senderId,
            content: type === 'audio' ? '🎤 Voice Message' : '📷 Image',
            contentType: type,
            fileUrl: fileUrl,
            disappearAt: disappearAt
        });

        const fullMessage = await Message.findById(newMessage._id)
            .populate('senderId', 'name profilePic email')
            .populate('chatId');

        await Chat.findByIdAndUpdate(chatId, { lastMessage: newMessage._id });

        res.status(201).json(fullMessage);
    } catch (error) {
        console.error("Upload Error:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    uploadMessage,
};