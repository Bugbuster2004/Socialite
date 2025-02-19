import User from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

export const getUsersForSidebar = async (req, res) => {
  try {
    const loggedInUserId = req.user._id;
    const filteredUsers = await User.find({
      _id: { $ne: loggedInUserId },
    }).select("-password");

    res.status(200).json(filteredUsers);
  } catch (error) {
    console.error("Error in getUsersForSidebar: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getMessages = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    });

    res.status(200).json(messages);
  } catch (error) {
    console.log("Error in getMessages controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text, image, audio } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;
    // console.log(req.user);

    let imageUrl;
    if (image) {
      const uploadResponse = await cloudinary.uploader.upload(image);
      imageUrl = uploadResponse.secure_url;
    }

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image: imageUrl,
    });

    await newMessage.save();

    // Real-time update for receiver
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
export const editMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const { text } = req.body;
    const userId = req.user._id;

    // Find the message by ID
    const message = await Message.findById(messageId);

    // Validate that the message exists and the sender is the current user
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not allowed to edit this message" });
    }

    // Update the message text
    message.text = text;
    message.editedAt = new Date();
    await message.save();

    // Notify the receiver about the edited message (real-time update)
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageEdited", message);
    }

    res.status(200).json(message);
  } catch (error) {
    console.error("Error in editMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id: messageId } = req.params;
    const userId = req.user._id;

    // Find the message by ID
    const message = await Message.findById(messageId);

    // Validate that the message exists and the sender is the current user
    if (!message) {
      return res.status(404).json({ error: "Message not found" });
    }
    if (message.senderId.toString() !== userId.toString()) {
      return res
        .status(403)
        .json({ error: "You are not allowed to delete this message" });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    // Notify the receiver about the deleted message (real-time update)
    const receiverSocketId = getReceiverSocketId(message.receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("messageDeleted", { messageId });
    }

    res.status(200).json({ message: "Message deleted successfully" });
  } catch (error) {
    console.error("Error in deleteMessage controller: ", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const getChatMedia = async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    // Fetch only messages that have images
    const mediaMessages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId, image: { $ne: null } },
        { senderId: userToChatId, receiverId: myId, image: { $ne: null } },
      ],
    }).select("image createdAt");

    res.status(200).json(mediaMessages);
  } catch (error) {
    console.error("Error in getChatMedia controller:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
