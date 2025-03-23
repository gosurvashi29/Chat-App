const express = require('express');
const router = express.Router();
const authenticate = require("../middleware/auth");
const { 
    createGroup, 
    getGroups, 
    inviteUserToGroup, 
    sendMessageToGroup 
} = require('../controllers/groupController');

// Create a new group
router.post('/create', authenticate, createGroup);

// Get all groups the user is a part of
router.get('/', authenticate, getGroups);

// Invite a user to a group
router.post('/:groupId/invite', authenticate, inviteUserToGroup);

// Send a message in a group
router.post('/:groupId/messages', authenticate, sendMessageToGroup);

module.exports = router;
