//const { User, ForgotPasswordRequest } = require("../models/Relation");
const { v4: uuidv4 } = require("uuid");
const form = require("../views/form");
const nodemailer = require('nodemailer');
const bcrypt = require("bcrypt");
const jwt= require("jsonwebtoken");
require("dotenv").config()

exports.forgotPassword = async (req, res) => {
  //send password link to user's email
  const userEmail = req.body.email;
  try {
    
    const user = await User.findOne({ where: { email: userEmail } });
    if (!user) return res.status(404).json({ message: "User not found" });

    
    const uuid = uuidv4();
    await user.createForgotPasswordRequest({ id: uuid, isActive: true });

    const transporter = nodemailer.createTransport({
        service:"gmail",
      host: "smtp.gmail.email",
      port: 587,
      secure: false, 
      auth: {
        user: process.env.USER,
        pass: process.env.PASSWORD,
      },
    });
    
    
    
    async function main() {
        
        const info = await transporter.sendMail({
            from: process.env.USER, // sender address
            to: userEmail, // list of receivers
            subject: "Password Reset Request",
            text: "Hello world!", 
            html:`
      <p>Hi ${user.username},</p>
      <p>Please click the <a href="http://localhost:3000/password/reset-password/${uuid}">link</a> to reset your password.</p>`

        });
      
        console.log("Message sent!");
        return res.status(202).json({ message: "Password reset email sent" });
        
      }
      
      main().catch(console.error);

}catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
}

exports.resetPassword = async (req, res) => {
  //Send reset password form
  try {
    const id = req.params.uuid;
    
    const userRequest = await ForgotPasswordRequest.findOne({ where: { id } });
    
    if (!userRequest)
      return res.status(401).json({ message: "User request not found" });

    if (!userRequest.isActive)
      return res.send(
        "<center><h1>Password reset request has expired!</h1></center>"
      );

    await userRequest.update({ isActive: false });

    res.status(200).send(form(id));
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" }); 
  }
}
exports.updatePassword = async (req, res) => {
  //Update the user's password
  try {
    const email = req.body.email;
    const password= req.body.newPassword;
    
    
    
    const user = await User.findOne({
      where : {email}});

    
    if (!user) return res.status(404).json({ message: "User not found" });

    const saltrounds=10;
        bcrypt.hash(password, saltrounds, async(err,hash)=>{
            if(err){
              console.log(err)
            }
            
                user.password=hash
                await user.save()
              });

    res.status(200).send("<center> <h1>Password updated</h1> </center>");
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" }); 
  }
};
