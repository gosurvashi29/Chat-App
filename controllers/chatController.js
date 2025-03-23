const Message = require('../models/messagesModel');  
const User  = require('../models/userModel');  
const Group = require('../models/groupModel');
const { Op } = require('sequelize');  



exports.getMessages = async (req, res) => {
    try {
        const { lastMessageId } = req.query;  // Get the ID of the last message the client has

        // If there is a lastMessageId, fetch messages newer than that
        const whereClause = lastMessageId ? { id: { [Op.gt]: lastMessageId } } : {};

        const messages = await Message.findAll({
            where: whereClause,  // Only get messages that are newer than lastMessageId
            include: {
                model: User,
                attributes: ['username'],  // Include the username of the user who sent the message
            },
            order: [['createdAt', 'ASC']],  // Order by createdAt to show messages in the correct order
        });

        res.status(200).json({ messages });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};


exports.addMessage = async (req, res) => {
    const { message, group_id } = req.body;  // Ensure group_id is part of the request body

    try {
        // Check if the user exists (this should be handled by your authentication middleware)
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        // Check if the group exists
        const group = await Group.findByPk(group_id);  // Ensure the group_id is valid
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        // Create the message in the correct group
        const newMessage = await Message.create({
            message: message,
            user_id: req.user.id,
            group_id: group_id,  // Use the group_id from the request body
        });

        // Return the message that was saved
        res.status(201).json({ message: newMessage });
    } catch (err) {
        console.error("Error saving message", err);
        res.status(500).json({ error: "Failed to save message" });
    }
};

exports.getActiveUsers = async (req, res) => {
    try {
        // Assuming you have a way to track active users (e.g., a session store or JWT tokens)
        const users = await User.findAll({
            attributes: ['id', 'username'],  
        });

        res.status(200).json({ users });
    } catch (err) {
        console.error("Error fetching active users:", err);
        res.status(500).json({ error: "Failed to fetch active users" });
    }
};