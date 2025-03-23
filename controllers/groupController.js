const { Op } = require('sequelize');
const Group = require('../models/groupModel');
const GroupMember = require('../models/userGroupModel');
const Message = require('../models/messagesModel');
const User = require('../models/userModel');

// Create a new group
exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        // Create a new group
        const group = await Group.create({
            name,
            createdBy: userId
        });

        // Automatically add the user as a member with 'admin' role
        await GroupMember.create({
            groupId: group.id,
            userId,
            role: 'admin'
        });

        res.status(201).json({ group });
    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ error: 'Failed to create group' });
    }
};

// Get all groups the user is a member of
exports.getGroups =async (req, res)=> {
    try {
        // Correct eager loading to include associated Users (if needed)
        const groups = await Group.findAll({
            include: [
                {
                    model: User,
                    as: 'Creator',  // Use the alias defined in the association
                }
            ]
        });
        
        res.json({ groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
}


// Invite a user to a group
exports.inviteUserToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { inviteeUserId } = req.body;
        const userId = req.user.id;

        // Check if the user is an admin of the group
        const isAdmin = await GroupMember.findOne({
            where: { userId, groupId, role: 'admin' }
        });

        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can invite users' });
        }

        // Add the invitee to the group as a member
        await GroupMember.create({
            groupId,
            userId: inviteeUserId,
            role: 'member'
        });

        res.status(200).json({ message: 'User invited successfully' });
    } catch (err) {
        console.error('Error inviting user to group:', err);
        res.status(500).json({ error: 'Failed to invite user' });
    }
};

// Send a message in a group
exports.sendMessageToGroup = async (req, res) => {
    try {
        const { groupId } = req.params;
        const { message } = req.body;
        const userId = req.user.id;

        // Check if the user is a member of the group
        const isMember = await GroupMember.findOne({
            where: { userId, groupId }
        });

        if (!isMember) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }

        // Create and save the message
        const newMessage = await Message.create({
            message,
            userId,
            groupId
        });

        res.status(201).json({ message: newMessage });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
};
