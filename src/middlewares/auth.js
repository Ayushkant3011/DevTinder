const jwt = require("jsonwebtoken");
const User = require("../models/user");

require("dotenv").config();

const userAuth = async(req, res, next) =>{
    try{
        // Read token from the cookie
        const {token} = req.cookies;

        if(!token) return res.status(401).send("Please login!!")
        // verify the token 
        const decodedObj = await jwt.verify(token, process.env.JWT_SECRET);

        const { _id } = decodedObj;

        // Find the user 
        const user = await User.findById( _id );

        if(!user) throw new Error("User not Found !!");
        
        req.user = user;

        next();
    }
    catch(err){
        res.status(400).send( "ERROR : "+err.message);
    }
};


module.exports = {
    userAuth,
}