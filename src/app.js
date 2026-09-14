const express = require("express");
const app = express();

require("dotenv").config({
    path: `.env.${process.env.NODE_ENV || "development"}`
});
console.log(`Environment : ${process.env.NODE_ENV}`);

const {connectDB} = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// require("./utils/cronJob");

app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        "https://YOUR-VERCEL-FRONTEND.vercel.app"
    ],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const paymentRouter = require("./routes/payment");



app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', paymentRouter);


const PORT = process.env.PORT || 3011;
// this is a good way to first connect to db and then listen to server
connectDB()
    .then(() => {
        console.log("Db Connected Successfully");

        app.listen(PORT, "0.0.0.0", ()=>{
            console.log(`Server is running and listening on ${PORT}`);
        });
    }).catch((err) =>{
        console.log("DB connection Failed!!!!!");
    });
