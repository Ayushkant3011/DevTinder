const express = require("express");
const profileRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

const validator = require("validator");
const bcrypt = require("bcrypt");

profileRouter.get("/profile/view", userAuth, async (req, res) =>{
    try{
        const user = req.user;
        res.send(user);
    }
    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});


profileRouter.patch("/profile/edit", userAuth, async (req, res)=>{
    try{
        if(!validateEditProfileData(req)) throw new Error("Invalid Edit Request");


        const loggedInUser = req.user;


        Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

        await loggedInUser.save();

        // This is we are just sending a text as response
        // res.send(`${loggedInUser.firstName}, your profile was updated Successfully!!`);
        // This is a better way to send response with data 
        res.json({
            message: `${loggedInUser.firstName}, your profile was updated Successfully!!`,
            data: loggedInUser,
        });
    }catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
});


profileRouter.patch("/profile/password", userAuth, async (req, res) =>{
    try{
            
        const user = req.user;
        // Read both existing and new password
        const {password, newPassword} = req.body;
        
        if(!password || !newPassword) throw new Error("Password is required");
        // validate user is logged in -> this will be done by middleware

        // validate existing pass is correct bcrypt.compare
        const isCurrPasswordValid = await bcrypt.compare(password, user.password);

        if(!isCurrPasswordValid) throw new Error("Current Password is not valid");

        // check if the new password is strong enough
        if(!validator.isStrongPassword(newPassword)) throw new Error("Enter a strong password");

        const isSamePass = await bcrypt.compare(newPassword, user.password);

        if(isSamePass) throw new Error("New Password cannot be same as current password");
        // then update the password
        // First hash the password
        const hashPass = await bcrypt.hash(newPassword, 10);

        user.password = hashPass;

        await user.save();
        
        res.status(200).json({
            message: "Password updated successfully!!"
        });
    }
    catch(err){
        console.log("PASSWORD CHANGE ERROR:", err);

        res.status(400).json({
            message: err.message
        });
    }
});



module.exports = profileRouter;