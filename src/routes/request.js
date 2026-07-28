const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");

requestRouter.post("/sendRequest", userAuth, async (req, res) =>{
    const user = req.user;
    console.log("Sending connection request");

    res.send(user.firstName + " Sent Connection Request !");
});


module.exports = requestRouter;