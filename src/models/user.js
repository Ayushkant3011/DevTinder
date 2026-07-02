const mongoose = require("mongoose");
const validator = require("validator");


const userSchema = new mongoose.Schema({
    firstName : {
        type:String,
        required: true
    },
    lastName:{
        type: String,
    },
    emailId:{
        type:String,
        lowercase: true,
        required: true,
        unique: true,
        trim: true,
        validate(value){
            if(!validator.isEmail(value)) throw new Error("Invalid E-mail ID !!!!!!" + value);
        }
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(!validator.isStrongPassword(value)) throw new Error("Enter a strong password");
        }
    },
    age:{
        type: Number,
        min:18,
    },
    gender : {
        type: String,
        validate(value){
            if(!["male", "femal", "others"].includes(value)) throw new Error ("Gender data is not valid");
        }
    },
    photoUrl:{
        type: String,
        default: "https://png.pngtree.com/png-vector/20250512/ourmid/pngtree-default-avatar-profile-icon-gray-placeholder-vector-png-image_16213764.png",
        validate(value){
            if(!validator.isURL(value)) throw new Error("Invalid URL");
        }
    },
    about:{
        type:String,
        default:"This is default about of the user!!"
    },
    skills:{
        type: [String]
    }
},
{
    timestamps: true
}
);


module.exports = mongoose.model("User", userSchema);

