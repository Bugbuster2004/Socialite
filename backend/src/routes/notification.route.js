import express from "express";
import {
  getNotifications,
  createNotification,
  markAsRead,
  markChatNotificationsAsRead,
} from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// ✅ Get all notifications for a user
router.get("/fetch", protectRoute, getNotifications);

// ✅ Create notification
router.post("/create", protectRoute, createNotification);

// ✅ Mark a notification as read (delete it)
router.put("/:id/read", protectRoute, markAsRead);

// ✅ Mark a notification as read (delete it)
router.delete("/read/:senderId", protectRoute, markChatNotificationsAsRead);

export default router;
