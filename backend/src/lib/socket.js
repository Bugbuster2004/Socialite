import { Server } from "socket.io";
import http from "http";
import express from "express";
import Notification from "../models/notification.model.js"; // Import notification model

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
  // Send notifications when a message is received
  socket.on("sendNotification", async ({ receiverId, message }) => {
    try {
      const notification = new Notification({ userId: receiverId, message });
      await notification.save();

      const receiverSocketId = getReceiverSocketId(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("new_notification", notification);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server, activeChats };
