//const socket = io(); // this line will create connection and will generate socket id

let selectedGroupId = null;  


if (!token) {
    console.error('No token found. Please log in.');
    
    window.location.href = '../views/LogIn';  
}


async function loadGroups() {
    try {
        const response = await axios.get('http://localhost:3000/groups', {
            headers: { 'Authorization': token }
        });

        console.log(response.data.groups);  

        const groupsList = document.getElementById('groups-list');
        groupsList.innerHTML = '';  

        if (response.data.groups.length === 0) {
            
            const noGroupsMessage = document.createElement('li');
            noGroupsMessage.textContent = 'No groups available';
            groupsList.appendChild(noGroupsMessage);
        } else {
            
            response.data.groups.forEach(group => {
                const groupItem = document.createElement('li');
                groupItem.textContent = `${group.name} (ID: ${group.id})`;  
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


async function selectGroup(groupId) {
    selectedGroupId = groupId;  

    try {
        const response = await axios.get('http://localhost:3000/groups/messages', {
            headers: { 'Authorization': token },
            params: { groupId }  
        });

        console.log(response.data.messages);  

        const messagesContainer = document.getElementById('messages');
        messagesContainer.innerHTML = '';  

        response.data.messages.forEach(message => {
            const messageDiv = document.createElement('div');
            messageDiv.textContent = `${message.user_name}: ${message.message}`;
            messagesContainer.appendChild(messageDiv);
        });
    } catch (error) {
        console.error('Error loading messages for group:', error);
    }
}


const sendMessageInGroup = async () => {
    const message = document.getElementById("message").value;
    
    if (selectedGroupId === null) {
        console.error("No group selected. Please select a group first.");
        return;  
    }

    if (message.trim() !== "") {
        try {
            const response = await axios.post(
                "http://localhost:3000/groups/sendMessage",  
                {
                    message: message,
                    group_id: selectedGroupId  
                },
                { headers: { 'Authorization': token } }
            );

            console.log('Message sent successfully:', response.data);
            document.getElementById("message").value = ""; 
            selectGroup(selectedGroupId); 
        } catch (error) {
            console.error("Error sending message to DB:", error);
        }
    }
};

const sendMultimediaInGroup = async (req, res) => {
    //upload.single("images")
        console.log(req.body);  
        console.log(req.file);   

        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

       
        const fileName = req.file.filename;  

        if (selectedGroupId === null) {
            console.error("No group selected. Please select a group first.");
            return;  
        }

        if (fileName.trim() !== "") {
            try {
                const response = await axios.post(
                    "http://localhost:3000/upload/sendMultimedia",
                    {
                        message: fileName,  
                        group_id: selectedGroupId  
                    },
                    { headers: { 'Authorization': token } }
                );

                console.log('Message sent successfully:', response.data);
                document.getElementById("message").value = "";  

                
                selectGroup(selectedGroupId); 
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
            loadGroups();  
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
            loadGroups();  
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
            loadGroups();  
        } catch (error) {
            console.error('Error creating group:', error);
        }
    }
});



document.getElementById("send-btn").addEventListener("click", sendMessageInGroup);

/*document.getElementById("send-btn").addEventListener("click", (e)=>{
    const message = messageInput.value;
    console.log(message)
    socket.emit('message')
})*/

loadGroups();
