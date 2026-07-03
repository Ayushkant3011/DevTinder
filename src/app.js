const express = require("express");
const bcrypt = require("bcrypt");

const app = express();
const { adminAuth, userAuth } = require("./middlewares/auth")


const {connectDB} = require("./config/database");
const User = require("./models/user");


const {validateSignUpData} = require("./utils/validation");

app.use(express.json());

app.post("/signup", async (req,res) => {
    try{
        // Before checking anything first validate the data
        validateSignUpData(req);
        
        // Before saving anything Encrypt the password
        const {password} = req.body;
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

// get user by email 
app.get("/user", async (req, res) =>{
    try{
        const users = await User.find({emailId : req.body.emailId});

        if(users.length === 0) res.status(404).send("User not Found");
        else res.send(users);
    }
    catch(err){
        res.status(400).send("Something went wrong")
    }
});


// Feed API
app.get("/feed", async (req, res) => {
    try{
        const users = await User.find({});
        res.send(users);
    }catch(err){
        res.status(400).send("Something went wrong");
    }
});


// Delete user
app.delete("/user", async (req, res)=>{
    const userId = req.body.emailId;

    try{
        const user = await User.findOneAndDelete(userId); // findOneAndDelete({ _id : userId })

        res.send("User deleted");
    }
    catch(err){
        res.status(400).send("Something went wrong");
    }
});



// Update the user
app.patch("/user/:userId", async (req, res) => {
    const userId = req.params?.userId;
    const data = req.body;
    
    try{

        const ALLOWED_UPDATES = [
            "photoUrl",
            "about",
            "gender",
            "age",
            "skills",
        ];

        const isUpdateAllowed = Object.keys(data).every((k) =>{
            ALLOWED_UPDATES.includes(k);
        });

        if(!isUpdateAllowed) throw new Error("Update not allowed");

        if(data?.skills.length > 10) throw new Error("Skills cannot be more than 10");

        await User.findByIdAndUpdate({_id: userId}, data);

        res.send("User Updated successfully");
    }catch(err){
        res.status(400).send("Something went wrong");
    }
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
