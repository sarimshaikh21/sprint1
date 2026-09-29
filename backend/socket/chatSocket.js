const { MessageModel } = require('../config/db'); // Ensure you export MessageModel from db.js

module.exports = (io) => {
    let onlineUsers = {};

    io.on("connection", (socket) => {
        console.log("A user connected:", socket.id);

        socket.on("register_user", (userId) => {
            socket.join(userId);
            onlineUsers[userId] = socket.id;
            io.emit("get_online_users", Object.keys(onlineUsers));
        });

        socket.on("join_room", async (ticketId) => {
            socket.join(ticketId);
            try {
                // Now using the imported MessageModel
                const history = await MessageModel.find({ room: ticketId })
                    .sort({ timestamp: 1 }).limit(50);
                socket.emit("chat_history", history);
            } catch (err) { console.error("History fetch error:", err); }
        });

        socket.on("send_message", async (data) => {
            try {
                const newMessage = new MessageModel({
                    room: data.room,
                    author: data.author,
                    text: data.text,
                    time: data.time
                });
                await newMessage.save();
                io.to(data.room).emit("receive_message", data);
            } catch (err) { console.error("Save error:", err); }
        });

        socket.on("disconnect", () => {
            for (let userId in onlineUsers) {
                if (onlineUsers[userId] === socket.id) {
                    delete onlineUsers[userId];
                    break;
                }
            }
            io.emit("get_online_users", Object.keys(onlineUsers));
        });
    });
};
