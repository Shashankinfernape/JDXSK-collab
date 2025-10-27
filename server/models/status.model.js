const mongoose = require('mongoose');

const statusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  content: {
    type: String, // This could be an image URL or text
    required: true,
  },
  contentType: {
    type: String,
    enum: ['text', 'image'],
    default: 'image',
  },
  expiresAt: {
    type: Date,
    // Automatically expire after 24 hours
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), 
    index: { expires: '1s' } // MongoDB will auto-delete docs after this time
  }
}, {
  timestamps: true
});

const Status = mongoose.model('Status', statusSchema);
module.exports = Status;