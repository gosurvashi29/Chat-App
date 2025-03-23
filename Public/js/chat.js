const token = localStorage.getItem('token');  

async function fetchMessages() {
    try {
        const response = await axios.get("http://localhost:3000/chat/messages", {headers : {'Authorization': token}});
        const messagesContainer = document.getElementById("messages");
        messagesContainer.innerHTML = '';  
        response.data.messages.forEach(message => {
            const messageDiv = document.createElement("div");
            messageDiv.textContent = `${message.User.username}: ${message.message}`;
            messagesContainer.appendChild(messageDiv);
        });
    } catch (error) {
        console.error("Error fetching messages", error);
    }
}


async function sendMessage() {
    const message = document.getElementById("message").value;

    if (message.trim() !== "") {
        try {
            const response = await axios.post(
                "http://localhost:3000/chat/send", 
                {
                    message: message
                    
                }, 
                {headers : {'Authorization': token}}
            );

            console.log('Message saved in DB:', response.data);
            document.getElementById("message").value = ""; 

           
            fetchMessages();

        } catch (error) {
            console.error("Error sending message to DB:", error);
        }
    }
}

setInterval(fetchMessages, 1000);


document.getElementById("send-btn").addEventListener("click", sendMessage);

// Fetch messages when the page loads
fetchMessages();
