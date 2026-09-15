const socket = require("socket.io");


const initializeSocket = (server) =>{
    const io = socket(server, {
        cors:{
            origin: [
                process.env.CLIENT_URL,
                "https://dev-tinder-web-one-coral.vercel.app"
            ]
        }
    });

    io.on("connection", (socket) =>{
        // Handle Events
    });
}

module.exports = initializeSocket;