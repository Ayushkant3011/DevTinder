const express = require("express");
const app = express();

require("dotenv").config({
    path: `.env.${process.env.NODE_ENV || "development"}`
});
console.log(`Environment : ${process.env.NODE_ENV}`);

const {connectDB} = require("./config/database");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const http = require("http");

// this require will work only with AWS SES that this project uses to send emails
// require("./utils/cronJob");

app.use(cors({
    origin: [
        process.env.CLIENT_URL,
        "https://dev-tinder-web-one-coral.vercel.app"
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
const imageRouter = require("./routes/images");
const initializeSocket = require("./utils/socket");

app.get("/healthz", (req, res) => {
    res.status(200).send("DevTinder Backend is running");
});

app.use('/', authRouter);
app.use('/', profileRouter);
app.use('/', requestRouter);
app.use('/', userRouter);
app.use('/', paymentRouter);
app.use("/", imageRouter);

const server = http.createServer(app);
initializeSocket(server);
const PORT = process.env.PORT || 3011;
// this is a good way to first connect to db and then listen to server
// connectDB()
//     .then(() => {
//         console.log("Db Connected Successfully");

//         app.listen(PORT, "0.0.0.0", ()=>{
//             console.log(`Server is running and listening on ${PORT}`);
//         });
//     }).catch((err) =>{
//         console.log("DB connection Failed!!!!!");
//     });

// here instead of app.listen use server.listen to configure the socket.io
connectDB()
    .then(() => {
        console.log("Db Connected Successfully");

        server.listen(PORT, "0.0.0.0", ()=>{
            console.log(`Server is running and listening on ${PORT}`);
        });
    }).catch((err) =>{
        console.log("DB connection Failed!!!!!");
    });
