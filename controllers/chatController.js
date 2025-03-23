const Message = require('../models/messagesModel');  
const User  = require('../models/userModel');  

exports.getMessages = async (req, res) => {
    try {
        const messages = await Message.findAll({
            include: {
                model: User,
                attributes: ['username'],  
            },
            order: [['createdAt', 'ASC']],  
        });

        res.status(200).json({ messages });
    } catch (err) {
        console.error("Error fetching messages", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};


exports.addMessage = async (req, res) => {
    const { message} = req.body;
   

    try {
        
        const user = await User.findByPk(req.user.id);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        
        const newMessage = await Message.create({
            message: message,
            user_id: req.user.id,
        });

        
        res.status(201).json({ message: newMessage });
    } catch (err) {
        console.error("Error saving message", err);
        res.status(500).json({ error: "Failed to save message" });
    }
};
