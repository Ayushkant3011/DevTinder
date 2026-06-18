const express = require("express");

const app = express();


app.get("/user/:userId", (req, res) => {
    console.log(req.params);
    res.send({"firstName": "Ayush"});
});


app.use("/",(req,res)=>{
    res.send("Hello from the Dashboard !");
});


app.listen(3000, ()=>{
    console.log("Server is running");
});