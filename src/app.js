const express = require("express");
const bcrypt = require("bcrypt");

const app = express();

const { userAuth } = require("./middlewares/auth");
const {connectDB} = require("./config/database");
const User = require("./models/user");
const validator = require("validator");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");


const {validateSignUpData} = require("./utils/validation");

app.use(express.json());
app.use(cookieParser());




app.post("/login", async (req, res) => {
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
            res.send("Login Succes !!!!");
        }
        else throw new Error("Invalid Credentials");

    }catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
});


// Profile
app.get("/profile", userAuth, async (req, res) =>{
    try{
        const user = req.user;
        res.send(user);
    }
    catch(err){
        res.status(400).send("ERROR: " + err.message);
    }
});

app.post("/sendRequest", userAuth, async (req, res) =>{
    const user = req.user;
    console.log("Sending connection request");

    res.send(user.firstName + " Sent Connection Request !");
});

// this is a good way to first connect to db and then listen to server
connectDB()
    .then(() => {
        console.log("Db Connected Successfully");

        app.listen(3011, ()=>{
            console.log("Server is running and listening on 3011......");
        });
    }).catch((err) =>{
        console.log("DB connection Failed!!!!!");
    });
