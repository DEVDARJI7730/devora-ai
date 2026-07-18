const express = require('express');
const router = express.Router();
const {
  getChats,
  getChatById,
  createChat,
  addMessages,
  renameChat,
  togglePinChat,
  deleteChat,
  clearAllChats,
  searchChats,
} = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

// Apply protection to all chat routes
router.use(protect);

router.route('/')
  .get(getChats)
  .post(createChat)
  .delete(clearAllChats);

router.get('/search', searchChats);

router.route('/:id')
  .get(getChatById)
  .delete(deleteChat);

router.post('/:id/messages', addMessages);
router.put('/:id/rename', renameChat);
router.put('/:id/pin', togglePinChat);

module.exports = router;
