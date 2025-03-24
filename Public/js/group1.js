
if (!token) {
    console.error('No token found. Please log in.');
    // Optionally, you can redirect the user to the login page
    window.location.href = '../views/LogIn';  // Adjust according to your app's structure
}

// Fetch and display the groups the user is part of
async function loadGroups1() {
    try {
        const response = await axios.get('http://localhost:3000/groups', {
            headers: { 'Authorization': token }
        });
            console.log(response.data.groupsName)
        const groupsList = document.getElementById('groups-list');
        groupsList.innerHTML = '';  // Clear current groups

        if (!response.data.groupsName) {
            // Display message if no groups are found
            const noGroupsMessage = document.createElement('li');
            noGroupsMessage.textContent = 'No groups available';
            groupsList.appendChild(noGroupsMessage);
        } else {
            // Populate groups list
            response.data.groupsName.forEach(group => {
                const groupItem = document.createElement('li');
                groupItem.textContent = group;
                groupItem.addEventListener('click', () => {
                    selectGroup(group);
                });
                groupsList.appendChild(groupItem);
            });
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

async function loadGroups() {
    try {
        const token = localStorage.getItem('token');  
        
        const response = await axios.get('http://localhost:3000/groups', {
            headers: { 'Authorization': token }
        });

        console.log(response.data.groups);  // Check the structure of the response

        const groupsList = document.getElementById('groups-list');
        groupsList.innerHTML = '';  // Clear current groups

        if (response.data.groups.length === 0) {
            // Display message if no groups are found
            const noGroupsMessage = document.createElement('li');
            noGroupsMessage.textContent = 'No groups available';
            groupsList.appendChild(noGroupsMessage);
        } else {
            // Populate groups list
            response.data.groups.forEach(group => {
                const groupItem = document.createElement('li');
                groupItem.textContent = `${group.name} (ID: ${group.id})`;  // Show both name and id
                groupItem.addEventListener('click', () => {
                    selectGroup(group.id);  // Pass group ID for selection
                });
                groupsList.appendChild(groupItem);
            });
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}


// Select a group and load its messages
async function selectGroup(groupid) {
    // Fetch and display messages for the selected group
    try {
        
        const token = localStorage.getItem('token');  
        
        const groupId = groupid;  // Assuming you have the groupId

        // Sending groupId in the body of the POST request
        const response = await axios.get('http://localhost:3000/groups/messages', 
                { headers: { 'Authorization': token },params: { groupId }}
        );

        console.log(messages)
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';  

        response.data.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = `${message.user_id}: ${message.message}`;
            messagesContainer.appendChild(messageDiv);
        });
    } catch (error) {
        console.error('Error loading messages for group:', error);
    }
}

// Create a new group
document.getElementById('create-group-btn').addEventListener('click', async () => {
    const groupName = prompt('Enter group name:');
    if (groupName) {
        try {
            await axios.post('http://localhost:3000/groups/create', { name: groupName }, {
                headers: { 'Authorization': token }
            });
            loadGroups();  
        } catch (error) {
            console.error('Error creating group:', error);
        }
    }
});

// invite users to group
document.getElementById('invite-users-btn').addEventListener('click', async () => {
    const groupName = prompt('Enter group name:');
    const userName = prompt('Enter member name:');
    if (groupName) {
        try {
            await axios.post('http://localhost:3000/groups/invite', {groupName,userName }, {
                headers: { 'Authorization': token }
            });
            alert("User Added Successfully!")
            loadGroups();  // Reload groups after creating a new one
        } catch (error) {
            console.error('Error creating group:', error);
        }
    }
});

const sendMessageInGroup = async () => {
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

document.getElementById("send-btn").addEventListener("click", sendMessageInGroup);
//as page reloads
loadGroups();
