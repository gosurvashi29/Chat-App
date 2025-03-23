// models/messageModel.js
const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./userModel');
const Message = sequelize.define('Message', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    message: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
});

// Define relationships
Message.belongsTo(User, { foreignKey: 'user_id' });  // Each message belongs to one user
User.hasMany(Message, { foreignKey: 'user_id' });    // One user can have many messages

module.exports = Message;
