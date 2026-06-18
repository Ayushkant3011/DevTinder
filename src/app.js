const express = require("express");

const app = express();


app.get("/user", (req, res) => {
    console.log(req.query);
    res.send({"firstName": "Ayush"});
});


app.use("/",(req,res)=>{
    res.send("Hello from the Dashboard !");
});


app.listen(3000, ()=>{
    console.log("Server is running");
});