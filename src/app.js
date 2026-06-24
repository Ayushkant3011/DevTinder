const express = require("express");

const app = express();
const { adminAuth, userAuth } = require("./middlewares/auth")


const {connectDB} = require("./config/database");



app.get("/admin", adminAuth);

app.get("/user/:userId", userAuth, (req, res) => {
    console.log(req.params);
    res.send({"firstName": "Ayush"});
});


app.use("/",(req,res)=>{
    res.send("Hello from the Dashboard !");
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
