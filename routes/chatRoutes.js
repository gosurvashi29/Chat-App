const express = require('express');
const router = express.Router();
const authenticate = require("../middleware/auth");
const { getMessages, addMessage } = require('../controllers/chatController');

// Get all messages
router.get('/messages', authenticate, getMessages);

// Send a new message
router.post('/send', authenticate, addMessage);

module.exports = router;
