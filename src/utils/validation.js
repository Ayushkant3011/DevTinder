const validadtor = require("validator");

const validateSignUpData = (req) =>{
    const {firstName, lastName, emailId, password} = req.body;


    if(!firstName || !lastName) throw new Error("Please enter your name");

    else if(!validadtor.isEmail(emailId)) throw new Error("Email is not valid!!");

    else if(!validator.isStrongPassword(password)) throw new Error("Enter a Strong password");
};


module.exports = {
    validateSignUpData
}