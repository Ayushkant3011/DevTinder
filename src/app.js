const express = require("express");

const app = express();


app.use("/home",(req,res)=>{
    res.send("Hello from the Home !");
});



app.use("/test",(req,res)=>{
    res.send("Hello from the server !");
});



app.use("/",(req,res)=>{
    res.send("Hello from the Dashboard !");
});


app.listen(3000, ()=>{
    console.log("Server is running");
});