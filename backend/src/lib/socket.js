import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

// used to store online users
const userSocketMap = {}; // {userId: socketId}
const activeChats = new Set(); // ✅ Store active chat user IDs

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("chat_open", (userId) => {
    activeChats.add(userId); // ✅ Add user to active chats
    console.log("Chat opened:", userId);
  });

  socket.on("chat_close", (userId) => {
    activeChats.delete(userId); // ✅ Remove user from active chats
    console.log("Chat closed:", userId);
  });

  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server, activeChats };
