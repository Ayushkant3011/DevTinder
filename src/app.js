const express = require("express");

const app = express();
const { adminAuth, userAuth } = require("./middlewares/auth")


const {connectDB} = require("./config/database");
const User = require("./models/user");


app.post("/signup", async (req,res) => {
    
    //creating a new instance of the User model
    const user = new User({
        firstName : "Ayush",
        lastName : "Kant",
        emailId : "ayushkant@gmail.com",
        password : "ayush@123"
    });


    await user.save();

    res.send("User Created");
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
