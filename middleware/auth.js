const jwt = require('jsonwebtoken');
const User = require('../models/userModel')

const authenticate = async(req,res,next)=>{

    try{
        const token= req.header('Authorization');
        
        console.log("user is, ", token)
        const decoded = jwt.verify(token,process.env.TOKEN);
        console.log("user is, ", decoded)
        const user= await User.findByPk(decoded.userId)
        console.log("user is, ", user)
         if (!user){
            return res.status(401).json({message : "User Not Found!"})
         }
            
            req.user=user;// very imp line as using this the global variable req object will attach user with it
            // whose expenses needs to be fetched, and so this will go with next(), and then tofetchexpenes()
            next();
        
    } catch(err){
        console.log(err);
        return res.status(401).json({success:false})
    }
}

module.exports=authenticate;