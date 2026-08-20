const express = require("express");
const authRouter = express.Router();
const {validateSignUpData} = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const validator = require("validator");
const mongoose = require("mongoose");

authRouter.post("/signup", async (req,res) => {
    try{
        // Before checking anything first validate the data
        validateSignUpData(req);
        
        // Before saving anything Encrypt the password
        const {firstName,
            lastName,
            emailId,
            password} = req.body;
        const hashPassword = await bcrypt.hash(password, 10)

        // USing data dynamically and taking from the request body
        // const user = new User(req.body); // this is a bad way to store the data 
        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashPassword,
        });

        
        const savedUser = await user.save();
        const token = await savedUser.getJWT();

        res.cookie("token", token, {
            expires: new Date(Date.now() + 8*3600000),
        });

        res.json({ message: "User Added successfully!", data: savedUser });
    }catch(err){
        res.status(400).send("ERROR :" + err.message);
    }
});




authRouter.post("/login", async (req, res) => {
    try{
        const {emailId, password} = req.body;

        if(!validator.isEmail(emailId)) throw new Error("Email not Valid!!");

        const user = await User.findOne({emailId: emailId});
        if(!user) throw new Error ("Invalid Credentials");

        const isPassowordValid = await user.validatePass(password);

        if(isPassowordValid){
        
            // create a JWT Token
            const token = await user.getJWT();
            

            // Add the Token to the cookie and send the response back to user
        
            res.cookie("token", token, {
                expires: new Date(Date.now() + 8 * 3600000),
            });
            res.send(user);
        }
        else throw new Error("Invalid Credentials");

    }catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
});



authRouter.post("/logout", async (req, res)=>{
    res
    .cookie("token", null, {
        expires: new Date(Date.now()),
    })
    .send("Logout Successfull!!!");

});



module.exports = authRouter;