const express = require("express");

const app = express();
const { adminAuth, userAuth } = require("./middlewares/auth")


require("./config/database");



app.get("/admin", adminAuth);

app.get("/user/:userId", userAuth, (req, res) => {
    console.log(req.params);
    res.send({"firstName": "Ayush"});
});


app.use("/",(req,res)=>{
    res.send("Hello from the Dashboard !");
});


app.listen(3000, ()=>{
    console.log("Server is running");
});