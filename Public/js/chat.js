const token = localStorage.getItem('token'); 
const socket = io("http://localhost:3000"); // Connect to the server

/// Ensure the function is defined before it's used
function sendMessage() {
    const message = document.getElementById("message").value;
    
    if (message.trim() !== "") {
        // Send the message via Socket.IO to broadcast
        socket.emit("sendMessage", { text: message, userId: user.id });

        // Send the message to the API to store in the database
        try {
            const response = axios.post("http://localhost:3000/chat/send", {
                message: message,
                userId: user.id
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('Message saved in DB:', response.data);
        } catch (error) {
            console.error('Error sending message to DB:', error);
        }

        // Clear the message input
        document.getElementById("message").value = "";
    }
}

// Fetch active users
async function getActiveUsers() {
    try {
        const response = await axios.get("http://localhost:3000/chat/users/active", {
            headers: { Authorization: `Bearer ${token}` }
        });

        const usersList = document.getElementById("users");
        usersList.innerHTML = '';
        response.data.users.forEach(user => {
            const li = document.createElement('li');
            li.textContent = user.username;
            usersList.appendChild(li);
        });
    } catch (error) {
        console.error("Error fetching users", error);
    }
}

// Display incoming messages
socket.on("message", (message) => {
    const messagesContainer = document.getElementById("messages");
    const messageDiv = document.createElement("div");
    messageDiv.textContent = `${message.username}: ${message.text}`;
    messagesContainer.appendChild(messageDiv);
});

// Attach sendMessage function to button click event
document.getElementById("send-btn").addEventListener("click", sendMessage);

// Fetch active users when the page loads
getActiveUsers();

// Listen for events (like user login, chat refresh, etc.)
// Here we assume a user has logged in already and has an active session.
socket.emit("join", { token }); // Notify the server that the user has joined the chat
