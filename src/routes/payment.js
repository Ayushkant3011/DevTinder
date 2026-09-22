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
paymentRouter.post("/payment/webHook", async (req, res) => {
    try {

        console.log("🔥🔥 WEBHOOK RECEIVED");

        const webHookSignature = req.get("X-Razorpay-Signature");

        console.log("Webhook signature exists:", !!webHookSignature);

        const isWebhookValid = validateWebhookSignature(
            JSON.stringify(req.body),
            webHookSignature,
            process.env.RAZORPAY_WEBHOOK_SECRET
        );

        console.log("Webhook valid:", isWebhookValid);

        if (!isWebhookValid) {
            console.log("❌ Invalid webhook signature");
            return res.status(400).json({
                message: "Webhook Signature Invalid"
            });
        }

        const paymentDetails = req.body.payload.payment.entity;

        console.log("💰 Payment details:", paymentDetails);

        const payment = await Payment.findOne({
            orderId: paymentDetails.order_id
        });

        console.log("💳 Payment found:", payment);

        if (!payment) {
            console.log("❌ Payment not found for order:", paymentDetails.order_id);

            return res.status(404).json({
                message: "Payment not found"
            });
        }

        payment.status = paymentDetails.status;

        await payment.save();

        console.log("✅ Payment status updated:", payment.status);

        const user = await User.findOne({
            _id: payment.userId
        });

        console.log("👤 User found:", user?._id);

        if (!user) {
            console.log("❌ User not found");

            return res.status(404).json({
                message: "User not found"
            });
        }

        user.isPremium = true;

        console.log("⭐ Setting user premium");

        user.membershipType = payment.notes?.membershipType;

        await user.save();

        console.log("✅ USER SAVED AS PREMIUM");

        return res.status(200).json({
            message: "Webhook received successfully!"
        });

    } catch (err) {

        console.error("❌ WEBHOOK ERROR:", err);

        return res.status(500).json({
            message: err.message
        });
    }
});


paymentRouter.get("/premium/verify", userAuth, async(req,res)=>{
    const user = req.user.toJSON();

    if(user.isPremium) return res.json({ isPremium: true });

    return res.json({ isPremium: false });
});

module.exports = paymentRouter;