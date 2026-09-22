const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const ConnectionRequest = require("../models/connectionRequest");

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
            console.log("Chat CONNECTED")
            const roomId = getSecretRoomId(userId, targetUserId);
            
            console.log(firstName + " Joined room :" + roomId);

            socket.join(roomId);
        });

        socket.on(
            "sendMessage", 
            async ({firstName, lastName, userId, targetUserId, text, photoUrl })=>{
                
                try{

                    console.log("========== SEND MESSAGE ==========");
                    console.log("userId:", userId);
                    console.log("targetUserId:", targetUserId);
                    console.log("text:", text);
                    const roomId = getSecretRoomId(userId, targetUserId);
                    
                    console.log(firstName + " " + text);

                    // TODO:
                    // Check if userId and targetUserId are friends 
                    // ConnectionRequest.findOne({ fromUserId: userId, toUserId: targetUserId, status: "accepted"});

                    // Save Message to the DB
                    let chat = await Chat.findOne({
                        participants: { $all: [userId, targetUserId] },
                    });
                    console.log("Existing chat:", chat);
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
                    console.log("Message pushed:", chat.messages);

                    await chat.save();
                    console.log("✅ Chat saved successfully");
                    const savedMessage = chat.messages[chat.messages.length - 1];

                    io.to(roomId).emit("MessageReceived", {
                        senderId: userId,
                        firstName,
                        lastName,
                        text,
                        photoUrl,
                        createdAt: savedMessage.createdAt,
                    });
                    console.log("✅ Message emitted");
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