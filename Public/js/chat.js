//const socket = io(); // this line will create connection and will generate socket id
const token = localStorage.getItem('token');  

/*socket.on("message", (messages) => {
    renderMessages(messages);
});*/

async function fetchMessages() {
    try {

        const lastMessage = JSON.parse(localStorage.getItem('messages'))?.[0];
        const lastMessageId = lastMessage ? lastMessage.id : null;
        const response = await axios.get("http://localhost:3000/chat/messages", {headers : {'Authorization': token}, params: { lastMessageId }});

         // Add the new messages to the existing ones
         const newMessages = response.data.messages;
         if (newMessages.length > 0) {
             // Get existing messages from localStorage
             let messages = JSON.parse(localStorage.getItem('messages')) || [];
 
             // Prepend new messages to the front of the array
             messages = [...newMessages, ...messages];
 
             // Limit to 10 messages
             if (messages.length > 10) {
                 messages = messages.slice(0, 10);  // Keep only the most recent 10 messages
             }
 
             // Store the updated messages back to localStorage
             localStorage.setItem('messages', JSON.stringify(messages));
 
             // Render messages on the screen
             renderMessages(messages);
        
        }
    } catch (error) {
        console.error("Error fetching messages", error); 
    }
}


function renderMessages(messages) {
    const messagesContainer = document.getElementById("messages");
    messagesContainer.innerHTML = '';  // Clear previous messages
    
    
    messages.forEach(message => {
        const messageDiv = document.createElement("div");
        messageDiv.textContent = `${message.user_name}: ${message.message}`;
        messagesContainer.appendChild(messageDiv);
    });

}

async function fetchActiveUsers() {
    try {
        const response = await axios.get("http://localhost:3000/chat/active-users", {
            headers: {
                'Authorization': token
            }
        });

        const usersList = document.getElementById("users");
        usersList.innerHTML = '';  // Clear previous user list

        response.data.users.forEach(user => {
            const userItem = document.createElement("li");
            userItem.textContent = `${user.username} Joined`;
            usersList.appendChild(userItem);
        });
    } catch (error) {
        console.error("Error fetching active users:", error);
    }
}

const sendMessage = async () => {
    const message = document.getElementById("message").value;
    const groupId = 1;  // Example, get the current group ID that the user is in

    if (message.trim() !== "") {
        try {
            const response = await axios.post(
                "http://localhost:3000/chat/send",
                {
                    message: message,
                    group_id: groupId  // Send the group ID along with the message
                },
                { headers: { 'Authorization': token } }
            );

            console.log('Message saved in DB:', response.data);
            document.getElementById("message").value = "";  // Clear the input field

            fetchMessages();  // Reload messages after sending a new one
        } catch (error) {
            console.error("Error sending message to DB:", error);
        }
    }
};

window.onload = function () {
    const storedMessages = JSON.parse(localStorage.getItem('messages')) || [];
    renderMessages(storedMessages);
    
    
    fetchMessages();
};
//setInterval(fetchMessages, 1000);


//document.getElementById("send-btn").addEventListener("click", sendMessage);


fetchActiveUsers();
