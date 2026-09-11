const express = require("express");
const { userAuth } = require("../middlewares/auth");
const paymentRouter = express.Router();
const razorpayInstance = require("../utils/razorpay");
const Payment = require("../models/payment");
const membershipAmount = require("../utils/constants");
paymentRouter.post("/payment/create", userAuth, async(req,res) =>{
    try{
        const { membershipType } = req.body;
        const { firstName, lastName, emailId} = req.user;

        const order = await razorpayInstance.orders.create({
            amount: membershipAmount[membershipType] * 10,
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
        res.json({ ...savePayment.toJSON() });
    }
    catch(err){
        console.log(err);
    }
});





module.exports = paymentRouter;