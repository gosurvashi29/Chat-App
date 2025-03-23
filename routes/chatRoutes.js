// chatRouter.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const socketIo = require('socket.io');
const authenticate= require("../middleware/auth")
const {getActiveUsers,
    handleSocketConnection,
    activeUsers,addMessage} = require('../controllers/chatController')




// Get active users
router.get('/users/active', authenticate, getActiveUsers)

router.post('/send', authenticate, addMessage);

module.exports = router;
