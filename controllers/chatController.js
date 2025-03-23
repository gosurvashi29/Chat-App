const jwt = require('jsonwebtoken');
const { User, Message } = require('../models/messagesModel');  // Assuming Message model exists
const activeUsers = []; 

// Fetch active users (to be used in the frontend)
const getActiveUsers = (req, res) => {
    res.json({ users: activeUsers });
};

// Socket.IO handling for chat
const handleSocketConnection = (socket, io) => {
    console.log('A user connected: ' + socket.id);

    socket.on('join', (data) => {
        const { token } = data;
        let decodedToken;
        
        // Verify the token and extract user details
        try {
            decodedToken = jwt.verify(token, process.env.TOKEN);
        } catch (err) {
            console.error('Invalid token:', err);
            socket.emit('message', { username: 'System', text: 'Invalid token, please log in again.' });
            return;
        }

        // Add the user to the active users list
        const user = { id: socket.id, username: decodedToken.username };
        activeUsers.push(user);

        // Notify others about the new user
        socket.broadcast.emit('message', { username: 'System', text: `${user.username} has joined the chat.` });
    });

    socket.on('sendMessage', async (data) => {
        const { text, token } = data;
        let decodedToken;

        // Verify the token and get user info
        try {
            decodedToken = jwt.verify(token, process.env.TOKEN);
        } catch (err) {
            console.error('Invalid token:', err);
            socket.emit('message', { username: 'System', text: 'Invalid token, please log in again.' });
            return;
        }

        const user = decodedToken.username;

        // Store the message in the database
        try {
            const newMessage = await Message.create({
                message: text,
                user_id: decodedToken.id  // Use the user's id from the decoded token
            });

            // Broadcast the message to all connected clients
            io.emit('message', { username: user, text: text });

        } catch (err) {
            console.error('Error storing message:', err);
            socket.emit('message', { username: 'System', text: 'Error sending message, please try again.' });
        }
    });

    socket.on('disconnect', () => {
        const userIndex = activeUsers.findIndex(user => user.id === socket.id);
        if (userIndex !== -1) {
            const user = activeUsers.splice(userIndex, 1)[0];  // Remove the user from active users

            // Notify others that the user has left
            socket.broadcast.emit('message', { username: 'System', text: `${user.username} has left the chat.` });
        }
    });
};

// API endpoint to save a chat message in the database
const addMessage = async (req, res) => {
    try {
        const { message, userId } = req.body;  // Get message and userId from the request body

        // Check if the user exists
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Create a new chat message in the database
        const newMessage = await Message.create({
            message,
            user_id: userId
        });

        // Send the response with the new message
        res.status(201).json({ message: newMessage });
    } catch (err) {
        console.error('Error saving message:', err);
        res.status(500).json({ error: 'Something went wrong' });
    }
};

// Export all necessary methods
module.exports = {
    getActiveUsers,
    handleSocketConnection,
    addMessage,
    activeUsers
};
