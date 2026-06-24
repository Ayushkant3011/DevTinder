const mongoose = require("mongoose");

const connectDB = async () => {
    await mongoose.connect(
    );
};


// This is not a good way
connectDB()
    .then(() => {
        console.log("Db Connected Successfully");
    }).catch((err) =>{
        console.log("DB connection Failed!!!!!");
    });