import Notification from "../models/notification.model.js";
import { io, getReceiverSocketId } from "../lib/socket.js";

/**
 * ✅ Get notifications for a specific user
 */
export const getNotifications = async (req, res) => {
  try {
    console.log("Fetching notifications for user:", req.user?.id);

    const notifications = await Notification.find({
      userId: req.user?.id,
    }).sort({ createdAt: -1 });

    console.log("Notifications found:", notifications);
    res.json(notifications);
  } catch (err) {
    console.error("Error fetching notifications:", err);
    res.status(500).json({ error: "Error fetching notifications" });
  }
};

/**
 * ✅ Create a new notification and send it in real-time
 */
export const createNotification = async (req, res) => {
  try {
    const { userId, message } = req.body;

    if (!userId || !message) {
      return res
        .status(400)
        .json({ error: "User ID and message are required" });
    }

    const newNotification = new Notification({
      userId,
      message,
    });

    await newNotification.save();

    // Real-time notification using Socket.IO
    const receiverSocketId = getReceiverSocketId(userId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("new_notification", newNotification);
    }

    res.status(201).json(newNotification);
  } catch (err) {
    console.error("Error creating notification:", err);
    res.status(500).json({ error: "Error creating notification" });
  }
};

/**
 * ✅ Mark notification as read (deletes it)
 */
export const markAsRead = async (req, res) => {
  try {
    await Notification.findByIdAndDelete(req.params.id);
    res.json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ error: "Error marking notification as read" });
  }
};

export const markChatNotificationsAsRead = async (req, res) => {
  try {
    const { senderId } = req.params;

    if (!senderId) {
      return res.status(400).json({ error: "Sender ID is required" });
    }

    const deletedNotifications = await Notification.deleteMany({
      senderId,
      userId: req.user._id, // Ensure only the logged-in user's notifications are deleted
    });

    res.json({
      message: "Notifications marked as read",
      deletedCount: deletedNotifications.deletedCount,
    });
  } catch (err) {
    console.error("Error marking notifications as read:", err);
    res.status(500).json({ error: "Error marking notifications as read" });
  }
};
