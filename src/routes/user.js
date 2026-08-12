const express = require("express");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const userRouter = express.Router();


// Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req,res) =>{
    try{
        const loggedInUser = req.user;


        const connectionRequest = await ConnectionRequest.find({
            toUserId : loggedInUser._id,
            status: "interested",            
        }).populate(
            "fromUserId", 
            "firstName  LastName photoUrl age gender about skills"
        );
        // }).populate("fromUserId", ["firstName", "LastName"]);


        res.json({
            message: "Data Fetched Successfully!!",
            data: connectionRequest,
        });
    }
    catch(err){
        req.status(400).send("ERROR : " + err.message);
    }
});



module.exports = userRouter;