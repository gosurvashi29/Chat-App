const { Op } = require('sequelize');
const Group = require('../models/groupModel');
const GroupMember = require('../models/userGroupModel');
const Message = require('../models/messagesModel');
const User = require('../models/userModel');


exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        
        const group = await Group.create({
            name,
            createdBy: userId
        });

        
         
        console.log("group created")
        
        await GroupMember.create({
            group_id: group.id,
            user_id: userId,
            
        });
       
        res.status(201).json({ group });
    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ error: 'Failed to create group' });
    }
};


exports.getGroups1 =async (req, res)=> {
    try {
        const userId= req.user.id;
        
        const groups = await Group.findAll({
            include: [
                {
                    model: User,
                    as: 'Creator',  
                }
            ]
        });
        
        res.json({ groups });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
}
exports.getGroups = async (req, res) => {
    try {
        const userId = req.user.id;

        
        const groupMembers = await GroupMember.findAll({
            where: { user_id: userId },
            attributes: ['group_id'] 
        });

        
        const groupIds = groupMembers.map(groupMember => groupMember.group_id);

        
        if (groupIds.length === 0) {
            return res.json({ groupsName: [] });
        }

        
        const groups = await Group.findAll({
            where: { id: groupIds }
        });

        
        const groupsData = groups.map(group => ({
            id: group.id,   
            name: group.name 
        }));

        
        res.json({ groups: groupsData });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
};


// Invite a user to a group
exports.inviteUserToGroup = async (req, res) => {
    try {
        const { groupName, userName } = req.body; 
        const userId = req.user.id; 

       
        const group = await Group.findOne({ where: { name: groupName } });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        console.log(group)
        
        const isAdmin = await GroupMember.findOne({
            where: {
                user_id:userId,
                group_id: group.id
                
            }
        });
        console.log(isAdmin)
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can invite users' });
        }
        console.log("usergroup created")
        
        const invitee = await User.findOne({ where: { username: userName } });

        if (!invitee) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log("group id is", group.id)
        console.log("invitee id is", invitee.id)
        
        await GroupMember.create({
            group_id: group.id,   
            user_id: invitee.id  
        });

        res.status(200).json({ message: 'User invited successfully' });
    } catch (err) {
        console.error('Error inviting user to group:', err);
        res.status(500).json({ error: 'Failed to invite user' });
    }
};



// Remove a user 
exports.removeUserFromGroup = async (req, res) => {
    try {
        const { groupName, userName } = req.body; // Get groupName and userName from the request body
        const userId = req.user.id; // The authenticated user ID

        // Find the group by its name
        const group = await Group.findOne({ where: { name: groupName } });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        console.log(group);
        
        // Check if the user is an admin of the group by querying the GroupMember table
        const isAdmin = await GroupMember.findOne({
            where: {
                user_id: userId,
                group_id: group.id
            }
        });
        console.log(isAdmin);
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can remove users' });
        }
        
        // Find the user to be removed by their username
        const userToRemove = await User.findOne({ where: { username: userName } });

        if (!userToRemove) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log("group id is", group.id);
        console.log("user to remove id is", userToRemove.id);

        // Remove the user from the group by deleting the entry in GroupMember
        await GroupMember.destroy({
            where: {
                group_id: group.id,    // The group ID
                user_id: userToRemove.id  // The user ID to be removed
            }
        });

        res.status(200).json({ message: 'User removed successfully' });
    } catch (err) {
        console.error('Error removing user from group:', err);
        res.status(500).json({ error: 'Failed to remove user' });
    }
};

// Make Group Admin
exports.makeAdminGroup = async (req, res) => {
    try {
        const { groupName, userName } = req.body; 
        const userId = req.user.id; 

       
        const group = await Group.findOne({ where: { name: groupName } });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        console.log(group)
        
        const isAdmin = await GroupMember.findOne({
            where: {
                user_id:userId,
                group_id: group.id
                
            }
        });
        console.log(isAdmin)
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can invite users' });
        }
        console.log("usergroup created")
        
        const invitee = await User.findOne({ where: { username: userName } });

        if (!invitee) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log("group id is", group.id)
        console.log("invitee id is", invitee.id)
        
        await GroupMember.create({
            group_id: group.id,   
            user_id: invitee.id  
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
        const { groupN } = req.body;
        const { message } = req.body;
        const userId = req.user.id;

        
        const isMember = await GroupMember.findOne({
            where: { userId, groupId }
        });

        if (!isMember) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }

        
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

exports.getMessagesFromGroup = async (req, res) => {
    try {
        const { groupId }  = req.query;  // Get the groupId from the request body
        
        const userId = req.user.id;    // Get the authenticated user's ID
        console.log(groupId);

        // Fetch messages for the specific group directly from the Group table
        const messages = await Message.findAll({
            where: { group_id : groupId }, // Filter groups by the groupId
            attributes: ['user_id', 'message'], // Fetch user_id and message columns
            order: [['createdAt', 'ASC']], // Order by the creation time of the messages (if applicable)
        });

        if (!messages) {
            return res.status(404).json({ error: 'No messages found for this group' });
        }

        // Return the messages (user_id and message) as a response
        res.status(200).json({ messages });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};
