import { create } from "zustand";
import { io } from "socket.io-client";
import { axiosInstance } from "../lib/axios"; // Import axios instance

const socket = io(import.meta.env.VITE_BACKEND_URL);

export const useNotificationStore = create((set, get) => ({
  notifications: [],

  /**
   * ✅ Fetch notifications from the backend
   */
  fetchNotifications: async () => {
    try {
      const res = await axiosInstance.get("/notifications/fetch");
      set({ notifications: res.data });
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  },

  /**
   * ✅ Add a notification to the store (real-time updates)
   */
  addNotification: (notification) => {
    // Prevent duplicate notifications
    const existingNotifications = get().notifications;
    if (!existingNotifications.some((n) => n._id === notification._id)) {
      set({ notifications: [notification, ...existingNotifications] });
    }
  },

  /**
   * ✅ Create a new notification and send it via WebSocket
   */
  createNotification: async (userId, message) => {
    try {
      const res = await axiosInstance.post("/notifications/create", {
        userId,
        message,
      });

      // Update the local state
      get().addNotification(res.data);

      // Emit real-time notification using Socket.IO
      socket.emit("send_notification", res.data);
    } catch (err) {
      console.error("Error creating notification:", err);
    }
  },

  /**
   * ✅ Mark notification as read (removes it)
   */
  markAsRead: async (notificationId) => {
    try {
      await axiosInstance.put(`/notifications/${notificationId}/read`);
      set((state) => ({
        notifications: state.notifications.filter(
          (n) => n._id !== notificationId
        ),
      }));
    } catch (err) {
      console.error("Error marking notification as read:", err);
    }
  },

  /**
   * ✅ Mark all notifications from a specific chat as read
   */
  markChatNotificationsAsRead: async (senderId) => {
    try {
      await axiosInstance.delete(`/notifications/read/${senderId}`);

      set((state) => ({
        notifications: state.notifications.filter(
          (n) => n.senderId !== senderId // Remove only the sender's notifications
        ),
      }));
    } catch (err) {
      console.error("Error marking notifications as read:", err);
    }
  },

  /**
   * ✅ Listen for real-time notifications via Socket.IO (initialized once)
   */
  initializeSocketListener: () => {
    const { addNotification } = get();

    // Prevent duplicate listeners by checking if already initialized
    if (!socket.hasListeners("new_notification")) {
      socket.on("new_notification", (notification) => {
        addNotification(notification);
      });
    }
  },
}));
