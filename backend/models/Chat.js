const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    enum: ['user', 'ai'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  attachment: {
    type: {
      type: String,
      enum: ['image', 'file'],
    },
    name: String,
    url: String,
    size: Number,
    preview: String,
  },
  generatedImage: String,
  generatedFile: {
    name: String,
    url: String,
    type: { type: String },
  },
  mode: String, // 'gemini', 'stable-diffusion', etc.
});

const ChatSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      default: 'New Chat',
      trim: true,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    messages: [MessageSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Chat', ChatSchema);
