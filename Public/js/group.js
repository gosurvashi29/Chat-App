// Fetch the token from localStorage
//const token = localStorage.getItem('token');

// Ensure the token exists, otherwise show an error
if (!token) {
    console.error('No token found. Please log in.');
    // Optionally, you can redirect the user to the login page
    window.location.href = '../views/LogIn';  // Adjust according to your app's structure
}

// Fetch and display the groups the user is part of
async function loadGroups() {
    try {
        const response = await axios.get('http://localhost:3000/groups', {
            headers: { 'Authorization': token }
        });
            console.log(response.data.groups)
        const groupsList = document.getElementById('groups-list');
        groupsList.innerHTML = '';  // Clear current groups

        if (!response.data.groups) {
            // Display message if no groups are found
            const noGroupsMessage = document.createElement('li');
            noGroupsMessage.textContent = 'No groups available';
            groupsList.appendChild(noGroupsMessage);
        } else {
            // Populate groups list
            response.data.groups.forEach(group => {
                const groupItem = document.createElement('li');
                groupItem.textContent = group.name;
                groupItem.addEventListener('click', () => {
                    selectGroup(group.id);
                });
                groupsList.appendChild(groupItem);
            });
        }
    } catch (error) {
        console.error('Error loading groups:', error);
    }
}

// Select a group and load its messages
async function selectGroup(groupId) {
    // Fetch and display messages for the selected group
    try {
        const response = await axios.get(`http://localhost:3000/groups/${groupId}/messages`, {
            headers: { 'Authorization': token }
        });

        // Assuming you have a 'messages' section in your HTML
        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';  // Clear previous messages

        response.data.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = `${message.User.username}: ${message.message}`;
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
            loadGroups();  // Reload groups after creating a new one
        } catch (error) {
            console.error('Error creating group:', error);
        }
    }
});

// Load groups when the page is ready
loadGroups();
