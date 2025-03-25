require('dotenv').config();
const express= require("express");
const { Op } = require('sequelize');
const Group = require('../models/groupModel');
const GroupMember = require('../models/userGroupModel');
const Message = require('../models/messagesModel');
const User = require('../models/userModel');
const AWSService = require('../services/awsService');
const sequelize= require("../util/database")
const fs = require('fs');
const path = require('path');
const app = express();
const http = require("http")
const { Parser } = require('json2csv');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server); 


exports.createGroup = async (req, res) => {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        
        const group = await Group.create({
            name,
            createdBy: userId
        });

        
         
        console.log("group created")
        
        await GroupMember.create({
            group_id: group.id,
            user_id: userId,
            isAdmin:true
            
        });
       
        res.status(201).json({ group });
    } catch (err) {
        console.error('Error creating group:', err);
        res.status(500).json({ error: 'Failed to create group' });
    }
};



exports.getGroups = async (req, res) => {
    try {
        const userId = req.user.id;
        console.log(userId)

        
        const groupMembers = await GroupMember.findAll({
            where: { user_id: userId },
            attributes: ['group_id'] 
        });

        
        
        const groupIds = groupMembers.map(groupMember => groupMember.group_id);

        
        if (groupIds.length === 0) {
            return res.json({ groupsName: [] });
        }

        
        const groups = await Group.findAll({
            where: { id: groupIds }
        });

        
        const groupsData = groups.map(group => ({
            id: group.id,   
            name: group.name 
        }));

        
        res.json({ groups: groupsData });
    } catch (error) {
        console.error('Error fetching groups:', error);
        res.status(500).json({ error: 'Failed to fetch groups' });
    }
};


// Invite a user to a group
exports.inviteUserToGroup = async (req, res) => {
    try {
        const { groupName, userName } = req.body; 
        const userId = req.user.id; 

       
        const group = await Group.findOne({ where: { name: groupName } });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        console.log(group)
        
        const isAdmin = await GroupMember.findOne({
            attributes: ['isAdmin'],  
            where: {
                user_id: userId,
                group_id: group.id
            }
        });

        console.log(isAdmin)
        
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can invite users' });
        }
        console.log("usergroup created")
        
        const invitee = await User.findOne({ where: { username: userName } });

        if (!invitee) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log("group id is", group.id)
        console.log("invitee id is", invitee.id)
        
        await GroupMember.create({
            group_id: group.id,   
            user_id: invitee.id,
            isAdmin:false 
        });

        res.status(200).json({ message: 'User invited successfully' });
    } catch (err) {
        console.error('Error inviting user to group:', err);
        res.status(500).json({ error: 'Failed to invite user' });
    }
};



// Remove a user 
exports.removeUserFromGroup = async (req, res) => {
    try {
        const { groupName, userName } = req.body; 
        const userId = req.user.id; 

        
        const group = await Group.findOne({ where: { name: groupName } });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        console.log(group);
        
        const isAdmin = await GroupMember.findOne({
            attributes: ['isAdmin'],  
            where: {
                user_id: userId,
                group_id: group.id
            }
        });

        console.log(isAdmin);
        
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can remove users' });
        }
        
        
        const userToRemove = await User.findOne({ where: { username: userName } });

        if (!userToRemove) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log("group id is", group.id);
        console.log("user to remove id is", userToRemove.id);

        
        await GroupMember.destroy({
            where: {
                group_id: group.id,    
                user_id: userToRemove.id  
            }
        });

        res.status(200).json({ message: 'User removed successfully' });
    } catch (err) {
        console.error('Error removing user from group:', err);
        res.status(500).json({ error: 'Failed to remove user' });
    }
};

// Make Group Admin
exports.makeAdminGroup = async (req, res) => {
    try {
        const { groupName, userName } = req.body; 
        const userId = req.user.id; 

       
        const group = await Group.findOne({ where: { name: groupName } });

        if (!group) {
            return res.status(404).json({ error: 'Group not found' });
        }
        console.log(group)
        
        const isAdmin = await GroupMember.findOne({
            attributes: ['isAdmin'],  
            where: {
                user_id: userId,
                group_id: group.id
            }
        });
       
        if (!isAdmin) {
            return res.status(403).json({ error: 'Only admins can invite users' });
        }
        console.log("usergroup created")
        
        const invitee = await User.findOne({ where: { username: userName } });

        if (!invitee) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log("group id is", group.id)
        console.log("invitee id is", invitee.id)
        
        
        invitee.isAdmin=true;
        await invitee.save();

        res.status(200).json({ message: 'User made admin successfully' });
    } catch (err) {
        console.error('Error inviting user to group:', err);
        res.status(500).json({ error: 'Failed to invite user' });
    }
};


// Send a message in a group
exports.sendMessageToGroup = async (req, res) => {
    try {
        const { group_id } = req.body;
        const { message } = req.body;
        const userId = req.user.id;

        
        const isMember = await GroupMember.findOne({
            where: { user_id:userId, group_id }
        });

        if (!isMember) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }
        const name = await User.findOne({
            where: { id:userId}
        });
        
        const newMessage = await Message.create({
            message,
            user_id:userId,
            user_name: name.username,
            group_id:group_id,
        });


        io.emit("message", { message: newMessage});

        res.status(201).json({ message: newMessage });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

// Send mutimedia in a group
exports.sendMultimedia = async (req, res) => {
    try {
        const { group_id } = req.body;
        const { message } = req.body;
        const userId = req.user.id;

        
        const isMember = await GroupMember.findOne({
            where: { user_id:userId, group_id }
        });

        if (!isMember) {
            return res.status(403).json({ error: 'You are not a member of this group' });
        }
        const name = await User.findOne({
            where: { id:userId}
        });
        
        const newMessage = await Message.create({
            message,
            user_id:userId,
            user_name: name.username,
            group_id:group_id,
        });


        io.emit("message", { message: newMessage});

        res.status(201).json({ message: newMessage });
    } catch (err) {
        console.error('Error sending message:', err);
        res.status(500).json({ error: 'Failed to send message' });
    }
};

exports.getMessagesFromGroup = async (req, res) => {
    try {
        const { groupId }  = req.query;  
        
        const userId = req.user.id;    
        console.log(groupId);

        
        const messages = await Message.findAll({
            where: { group_id : groupId }, 
            attributes: ['user_name', 'message'], 
            order: [['createdAt', 'ASC']], 
        });

        if (!messages) {
            return res.status(404).json({ error: 'No messages found for this group' });
        }

        
        res.status(200).json({ messages });
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ error: "Failed to fetch messages" });
    }
};

exports.downloadExpenses = async (req, res) => {
    try {
      const userId = req.user.id;
      const expenses = await req.user.getExpenses({
        attributes: ['amount', 'category', 'description', 'createdAt']
      });
  
      // Convert JSON to CSV
      const fields = ['amount', 'category', 'description', 'createdAt'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(expenses);
  
      // Generate unique key for the file
      const key = `myExpenses-${userId}-${Date.now()}.csv`;
  
      // Upload CSV to S3 using AWSService
      const uploadResult = await AWSService.uploadToS3(process.env.BUCKET_NAME, key, csv);
  
      // Save file info to the database
      const fileInfo = { fileName: key, url: uploadResult.Location };
      const response = await req.user.createDownloaded(fileInfo);
      console.log(response);
  
      return res.status(200).json({ fileUrl: uploadResult.Location });
    } catch (err) {
      console.error('Error in downloadExpenses controller:', err);
      return res.status(500).json({ message: "Internal server error" });
    }
  };

