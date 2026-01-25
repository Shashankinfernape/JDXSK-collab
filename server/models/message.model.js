const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String,
    required: false, // Can be empty if it's just an audio/image
  },
  contentType: {
    type: String,
    enum: ['text', 'image', 'audio'],
    default: 'text',
  },
  fileUrl: {
    type: String, 
  },
  // --- REPLACE 'readBy' WITH THIS ---
  deliveredTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  // --- ADD THIS FIELD for disappearing messages ---
  disappearAt: {
    type: Date,
  },
  // --- Reply Context ---
  replyTo: {
    _id: String, // Original message ID
    content: String, // Snapshot of content
    senderName: String // Snapshot of sender name
  }
}, {
  timestamps: true,
});

// --- ADD THIS TTL INDEX ---
// This tells MongoDB to auto-delete messages when 'disappearAt' time is reached.
messageSchema.index({ "disappearAt": 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;