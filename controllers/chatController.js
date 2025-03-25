require('dotenv').config();
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
    const { message, group_id } = req.body;  
    const userId = req.user.id;
    try {
        
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        
        const group = await Group.findByPk(group_id);  
        if (!group) {
            return res.status(404).json({ error: "Group not found" });
        }

        const name = await User.findOne({
            where: { userId}
        });
        
        

        
        const newMessage = await Message.create({
            message: message,
            user_id: req.user.id,
            user_name: name.id,
            group_id: group_id 
        });

        io.emit("message", { message: newMessage});
        
        res.status(201).json({ message: newMessage });
    } catch (err) {
        console.error("Error saving message", err);
        res.status(500).json({ error: "Failed to save message" });
    }
};

exports.getActiveUsers = async (req, res) => {
    try {
        
        const users = await User.findAll({
            attributes: ['id', 'username'],  
        });

        res.status(200).json({ users });
    } catch (err) {
        console.error("Error fetching active users:", err);
        res.status(500).json({ error: "Failed to fetch active users" });
    }
};