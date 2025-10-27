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
    required: true,
  },
  contentType: {
    type: String,
    enum: ['text', 'image'],
    default: 'text',
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
  }
}, {
  timestamps: true,
});

// --- ADD THIS TTL INDEX ---
// This tells MongoDB to auto-delete messages when 'disappearAt' time is reached.
messageSchema.index({ "disappearAt": 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;