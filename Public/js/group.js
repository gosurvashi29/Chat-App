let selectedGroupId = null;  // Variable to store the selected group ID


if (!token) {
    console.error('No token found. Please log in.');
    // Redirect to login page if no token is found
    window.location.href = '../views/LogIn';  
}

// Fetch and display the groups the user is part of
async function loadGroups() {
    try {
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
                    selectGroup(group.id);  // Set selected group ID when clicked
                });
                groupsList.appendChild(groupItem);
            });
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

// Handle group selection and load its messages
async function selectGroup(groupId) {
    selectedGroupId = groupId;  // Store the selected group ID

    try {
        const response = await axios.get('http://localhost:3000/groups/messages', {
            headers: { 'Authorization': token },
            params: { groupId }  // Pass groupId as query parameter
        });

        console.log(response.data.messages);  // Check the messages

        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';  // Clear previous messages

        response.data.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = `${message.user_id}: ${message.message}`;
            messagesContainer.appendChild(messageDiv);
        });
    } catch (error) {
        console.error('Error loading messages for group:', error);
    }
}

// Function to send a message to the selected group
const sendMessageInGroup = async () => {
    const message = document.getElementById("message").value;
    
    if (selectedGroupId === null) {
        console.error("No group selected. Please select a group first.");
        return;  // Prevent sending message if no group is selected
    }

    if (message.trim() !== "") {
        try {
            const response = await axios.post(
                "http://localhost:3000/chat/send",  // Assuming your backend endpoint is /chat/send
                {
                    message: message,
                    group_id: selectedGroupId  // Send the selected group ID along with the message
                },
                { headers: { 'Authorization': token } }
            );

            console.log('Message sent successfully:', response.data);
            document.getElementById("message").value = "";  // Clear the input field

            // Fetch and display the updated messages after sending a new one
            selectGroup(selectedGroupId); // Reload the messages for the selected group
        } catch (error) {
            console.error("Error sending message to DB:", error);
        }
    }
};
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


// remove user
document.getElementById('remove-users-btn').addEventListener('click', async () => {
    const groupName = prompt('Enter group name:');
    const userName = prompt('Enter member name:');
    if (groupName) {
        try {
            await axios.post('http://localhost:3000/groups/remove', {groupName,userName }, {
                headers: { 'Authorization': token }
            });
            alert("User Removed Successfully!")
            loadGroups();  // Reload groups after creating a new one
        } catch (error) {
            console.error('Error creating group:', error);
        }
    }
});

// make admin
document.getElementById('make-admin-btn').addEventListener('click', async () => {
    const groupName = prompt('Enter group name:');
    const userName = prompt('Enter member name:');
    if (groupName) {
        try {
            await axios.post('http://localhost:3000/groups/makeadmin', {groupName,userName }, {
                headers: { 'Authorization': token }
            });
            alert("User made Admin Successfully!")
            loadGroups();  // Reload groups after creating a new one
        } catch (error) {
            console.error('Error creating group:', error);
        }
    }
});


// Send message button event listener
document.getElementById("send-btn").addEventListener("click", sendMessageInGroup);

// Initial group load on page load
loadGroups();
