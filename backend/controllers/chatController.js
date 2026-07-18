const Chat = require('../models/Chat');

// @desc    Get all user chats (list overview)
// @route   GET /api/chats
// @access  Private
const getChats = async (req, res) => {
  try {
    // Select metadata of chats for listing to optimize performance
    const chats = await Chat.find({ user: req.user._id })
      .select('title isPinned createdAt updatedAt')
      .sort({ isPinned: -1, updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error fetching chats list' });
  }
};

// @desc    Get single chat session with details (all messages)
// @route   GET /api/chats/:id
// @access  Private
const getChatById = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error fetching chat details' });
  }
};

// @desc    Create new chat session
// @route   POST /api/chats
// @access  Private
const createChat = async (req, res) => {
  const { title } = req.body;

  try {
    const newChat = await Chat.create({
      user: req.user._id,
      title: title || 'New Chat',
      messages: [],
    });

    res.status(201).json(newChat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error creating chat' });
  }
};

// @desc    Add messages to chat session (updates history log)
// @route   POST /api/chats/:id/messages
// @access  Private
const addMessages = async (req, res) => {
  const { sender, text, attachment, generatedImage, generatedFile, mode } = req.body;

  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    const newMessage = {
      sender,
      text,
      attachment,
      generatedImage,
      generatedFile,
      mode,
      timestamp: Date.now(),
    };

    chat.messages.push(newMessage);
    
    // Auto rename if it's the first message block
    if (chat.messages.length === 1 && chat.title === 'New Chat') {
      const generatedTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
      chat.title = generatedTitle;
    }

    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error adding message' });
  }
};

// @desc    Rename chat title
// @route   PUT /api/chats/:id/rename
// @access  Private
const renameChat = async (req, res) => {
  const { title } = req.body;

  try {
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    chat.title = title;
    await chat.save();

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error renaming chat' });
  }
};

// @desc    Toggle pin/unpin chat session
// @route   PUT /api/chats/:id/pin
// @access  Private
const togglePinChat = async (req, res) => {
  try {
    const chat = await Chat.findOne({ _id: req.params.id, user: req.user._id });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    chat.isPinned = !chat.isPinned;
    await chat.save();

    res.json(chat);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error toggling pin state' });
  }
};

// @desc    Delete chat session
// @route   DELETE /api/chats/:id
// @access  Private
const deleteChat = async (req, res) => {
  try {
    const chat = await Chat.findOneAndDelete({ _id: req.params.id, user: req.user._id });

    if (!chat) {
      return res.status(404).json({ error: 'Chat session not found' });
    }

    res.json({ success: true, message: 'Chat deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error deleting chat' });
  }
};

// @desc    Clear all chats for user
// @route   DELETE /api/chats
// @access  Private
const clearAllChats = async (req, res) => {
  try {
    await Chat.deleteMany({ user: req.user._id });
    res.json({ success: true, message: 'All chats cleared successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error clearing chats' });
  }
};

// @desc    Search inside chats (titles and message contents)
// @route   GET /api/chats/search
// @access  Private
const searchChats = async (req, res) => {
  const { query } = req.query;

  try {
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }

    // Match title OR match message content
    const chats = await Chat.find({
      user: req.user._id,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { 'messages.text': { $regex: query, $options: 'i' } },
      ],
    }).select('title isPinned createdAt updatedAt');

    res.json(chats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server Error searching chats' });
  }
};

module.exports = {
  getChats,
  getChatById,
  createChat,
  addMessages,
  renameChat,
  togglePinChat,
  deleteChat,
  clearAllChats,
  searchChats,
};
