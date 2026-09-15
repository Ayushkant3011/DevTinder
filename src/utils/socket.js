const socket = require("socket.io");
const crypto = require("crypto");

const getSecretRoomId = (userId, targetUserId)=>{
    return crypto
        .createHash("sha256")
        .update([userId, targetUserId].sort().join("_"))
        .digest("hex");
};

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

        socket.on("joinChat", ({firstName, userId, targetUserId})=>{
            const roomId = getSecretRoomId(userId, targetUserId);
            
            console.log(firstName + " Joined room :" + roomId);

            socket.join(roomId);
        });

        socket.on(
            "sendMessage", 
            ({firstName, userId, targetUserId, text, photoUrl })=>{
                const roomId = getSecretRoomId(userId, targetUserId);
                console.log(firstName + " " + text);
                io.to(roomId).emit("MessageReceived", { firstName, text, photoUrl});

        });

        socket.on("disconnect", ()=>{

        });
    });
};

module.exports = initializeSocket;