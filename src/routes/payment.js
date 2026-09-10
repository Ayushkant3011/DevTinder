const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");


paymentRouter.post("/payment/create", userAuth, async(req,res) =>{
    try{
        const order = await razorpayInstance.orders.create({
            "amount": 50000,
            "currency": "INR",
            "receipt": "receipt#1",
            "notes": {
                "firstName": "value3",
                "lastName": "value2",
                "membershipType": "Gold",
            },
        });

        // save it in the database
        console.log(order);

        // Return back the order details to frontend
        res.json({ order });
    }
    catch(err){
        console.log(err);
    }
});





module.exports = paymentRouter;