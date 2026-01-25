const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }],
  isGroup: {
    type: Boolean,
    default: false,
  },
  groupName: {
    type: String,
    trim: true,
  },
  groupIcon: {
    type: String,
    default: '',
  },
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Message'
  },
  // --- Disappearing Messages Setting ---
  disappearingMessages: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

const Chat = mongoose.model('Chat', chatSchema);
module.exports = Chat;