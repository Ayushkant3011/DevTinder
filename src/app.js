const express = require("express");

const app = express();

const {connectDB} = require("./config/database");
const cookieParser = require("cookie-parser");



app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");



app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);



// this is a good way to first connect to db and then listen to server
connectDB()
    .then(() => {
        console.log("Db Connected Successfully");

        app.listen(3011, ()=>{
            console.log("Server is running and listening on 3011......");
        });
    }).catch((err) =>{
        console.log("DB connection Failed!!!!!");
    });
