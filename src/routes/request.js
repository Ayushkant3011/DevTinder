const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");


requestRouter.post("/request/send/:status/:toUserId", userAuth, async (req, res) =>{
    try{
        const fromUserId = req.user._id;
        const toUserId = req.params.toUserId;
        const status = req.params.status;


        const allowedStatus = ["ignored", "interested"];
        if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "Invalid Status Type" + status});
        }

        const toUser = await User.findById(toUserId);

        if(!toUser){
            return res.status(404).json({message: "User Does not Exists"});
        }
        
        // Check if there is an existing connectionRequest
        const existingConnectionRequest = await ConnectionRequest.findOne({
            $or: [
                {fromUserId, toUserId,},
                {fromUserId: toUserId, toUserId: fromUserId}
            ]
        });

        if(existingConnectionRequest){
            return res
                .status(400)
                .send({message: "Connection request already exists"});
        }


        const connectionRequest = new ConnectionRequest({
            fromUserId,
            toUserId,
            status,
        });


        const requestData = await connectionRequest.save();


        res.json({
            message: req.user.firstName + " is " + status + " in " + toUser.firstName,
            requestData,
        })
    }
    catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
});


// this API can be accessed by the reviewer
requestRouter.post("/request/review/:status/:requestId", userAuth, async(req, res) =>{
    try{
        const loggedInUser = req.user;
        const { status, requestId } = req.params;

        // validate the status
        const allowedStatus = ["accepted", "rejected"];

        if(!allowedStatus.includes(status)){
            return res.status(400).json({message: "Status not allowed! "});
        }

        // FromUser => toUser
        // LoggedInId == toUserId
        // status = interested

        // request id should be valid

        const connectionRequest = await ConnectionRequest.findOne({
            _id: requestId,
            toUserId : loggedInUser,
            status: "interested"
        });

        if(!connectionRequest){
            return res
                .status(404)
                .json({message: "Connection request not found"});
        }

        connectionRequest.status = status;

        const data = await connectionRequest.save();

        res.json({message: "Connection Request " + status, data});

        

    }
    catch(err){
        res.status(400).send("ERROR : " + err.message);
    }
});


module.exports = requestRouter;