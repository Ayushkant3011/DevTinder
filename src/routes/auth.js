const express = require("express");
const authRouter = express.Router();


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

        
        await user.save();

        res.send("User Created");
    }catch(err){
        res.status(400).send("ERROR :" + err.message);
    }
});







module.exports = authRouter;