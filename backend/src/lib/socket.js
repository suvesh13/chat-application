import { Server } from "socket.io"; // Fix: Corrected the package name from "soket.io" to "socket.io"
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"], // Allow requests from your frontend
  },
});

export function getRecevierSocketId(userId){
    return userSocketMap[userId];
}


//used to store online users
const userSocketMap = {}; //{userId:sockerId}

io.on("connection", (socket) => {
    console.log("A user connected", socket.id);
  
    const userId = socket.handshake.query.userId; // Get ID of the user who connected
    if (userId) userSocketMap[userId] = socket.id; // Store the online user
  
    // Emit the updated list of online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Consistent event name
  
    socket.on("disconnect", () => {
        console.log("A user disconnected", socket.id);
  
        // Remove the user from the online users map
        if (userId) delete userSocketMap[userId];
  
        // Emit the updated list of online users after a user disconnects
        io.emit("getOnlineUsers", Object.keys(userSocketMap)); // Fix: consistent event name
    });
});

export { io, server, app };
