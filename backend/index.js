require('dotenv').config();
const express = require('express');
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');
const apiRoutes = require('./routes/api');
const setupChatSocket = require('./socket/chatSocket');


const app = express();
const server = http.createServer(app);

const allowedOrigins = [
    // "http://localhost:5173", // Local development URL
    "https://helpdesk-ticketing-system-alpha.vercel.app" // Production URL
];

// Middlewares
app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static('uploads'));


app.use('/api', apiRoutes);

// 3. Socket.IO Setup
const io = new Server(server, {
    cors: { 
        origin: allowedOrigins, 
        methods: ["GET", "POST", "PATCH"],
        credentials: true
    }
});

setupChatSocket(io);

const PORT = process.env.PORT;
server.listen(PORT,'0.0.0.0', () =>{
    console.log("Server is running")
})