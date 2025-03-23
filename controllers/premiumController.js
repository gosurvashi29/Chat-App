const User = require('../models/userModel');
//const Expense = require('../models/expense');
const sequelize = require('../util/database');
const e = require('express');


const getUserLeaderBoard = async (req, res) => {
    try{
        const leaderboardofusers = await User.findAll({
            
            order:[['totalAmount', 'DESC']] // sorting

        })
       
        res.status(200).json(leaderboardofusers)
    
} catch (err){
    console.log(err)
    res.status(500).json(err)
}
}

module.exports = {
    getUserLeaderBoard
}


