// models/groupModel.js
const Sequelize = require('sequelize');
const sequelize = require('../util/database');
const User = require('./userModel');
//const UserGroup = require('./userGroupModel'); // Ensure this is properly imported

const Group = sequelize.define('Group', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdBy: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
}, {
    timestamps: true,  // Automatically adds createdAt and updatedAt
});

// Define relationships
Group.belongsTo(User, { foreignKey: 'createdBy', as: 'Creator' });  // A group is created by a user
User.hasMany(Group, { foreignKey: 'createdBy' }); // A user can create many groups

// Correct many-to-many relationship
Group.belongsToMany(User, { through: 'UserGroup', foreignKey: 'group_id' });
User.belongsToMany(Group, { through: 'UserGroup', foreignKey: 'user_id' });

module.exports = Group;
