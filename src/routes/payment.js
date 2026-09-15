const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const User = require("../models/user");
const {membershipAmount} = require("../utils/constants");
const {validateWebhookSignature} = require('razorpay/dist/utils/razorpay-utils')


paymentRouter.post("/payment/create", userAuth, async(req,res) =>{
    try{
        const { membershipType } = req.body;
        const { firstName, lastName, emailId} = req.user;

        const order = await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType] * 100,
            currency: "INR",
            receipt: "receipt#1",
            notes: {
                firstName,
                lastName,
                emailId,
                membershipType: membershipType,
            },
        });

        // save it in the database
        console.log(order);

        const payment = new Payment({
            userId: req.user._id,
            orderId: order.id,
            status: order.status,
            amount: order.amount,
            currency: order.currency,
            receipt: order.receipt,
            notes: order.notes,
        });

        const savePayment = await payment.save();

        // Return back the order details to frontend
        res.json({ ...savePayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID});
    }
    catch(err){
        console.log(err);
    }
});


// here UserAuth is not required as this api will be called by Razorpay
paymentRouter.post("/payment/webHook", async(req, res)=>{
    try{
        console.log("Razorpay WebHook called!!!!!!!!!!");
        const webHookSignature = req.get("X-Razorpay-Signature");

        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body), 
            webHookSignature, 
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        if(!isWebhookValid) 
            return res.status(400).json({ message: "Webhook Signature Invalide"});


        // Update payment status in db
        const paymentDetails = req.body.payload.payment.entity;
        const payment = await Payment.findOne({ orderId: paymentDetails.order_id });
        payment.status = paymentDetails.status;
        await payment.save();

        const user = await User.findOne({ _id: payment.userId });
        user.isPremium = true;
        user.membershipType = payment.notes.membershipType;

        await user.save();


        // Update the user as premium
        // return success response to razorpay
        // if(req.body.event == "payment.captured"){

        // }
        // if(req.body.event == "payment.failed"){

        // }
        console.log("WebHook saved Success !!!!!!!!!!!!!!!!!!");
        return res.status(200).json({message: "Webhook received successfully!"});
    }
    catch(err){
        return res.status(500).json({ merssage : err.messsage});
    }
})


paymentRouter.get("/premium/verify", userAuth, async(req,res)=>{
    const user = req.user.toJSON();

    if(user.isPremium) return res.json({ ispremium: true });

    return res.json({ isPremium: false });
});



module.exports = paymentRouter;