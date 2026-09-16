const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");

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
            async ({firstName, userId, targetUserId, text, photoUrl })=>{
                
                try{
                    const roomId = getSecretRoomId(userId, targetUserId);
                    
                    console.log(firstName + " " + text);

                    // Save Message to the DB
                    let chat = await Chat.findOne({
                        participants: { $all: [userId, targetUserId] },
                    });

                    if(!chat) {
                        chat = new Chat({
                            participants: [userId, targetUserId],
                            messages: [],
                        });
                    }

                    chat.messages.push({
                        senderId: userId,
                        text,
                    });

                    await chat.save();

                    io.to(roomId).emit("MessageReceived", { firstName, text, photoUrl});
                }
                catch(err){
                    console.log(err);
                }
        });

        socket.on("disconnect", ()=>{

        });
    });
};

module.exports = initializeSocket;