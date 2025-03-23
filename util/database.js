require('dotenv').config();

const Sequelize  = require("sequelize");

const sequelize= new Sequelize('group_chat', 'root' , 'admin1234',{
    dialect : 'mysql',
    host: 'localhost'
})

module.exports=sequelize;