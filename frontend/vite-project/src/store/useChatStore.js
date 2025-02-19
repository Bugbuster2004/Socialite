import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create(
  persist(
    (set, get) => ({
      messages: [],
      chatMedia: [],
      users: [],
      notifications: [],
      selectedUser: null, // ✅ Always reset on reload
      isUsersLoading: false,
      isMessagesLoading: false,
      hasHydrated: false,

      getUsers: async () => {
        set({ isUsersLoading: true });
        try {
          const res = await axiosInstance.get("/messages/users");
          set({ users: res.data });
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isUsersLoading: false });
        }
      },

      getMessages: async (userId) => {
        set({ isMessagesLoading: true });
        try {
          const res = await axiosInstance.get(`/messages/${userId}`);
          set({ messages: res.data });
        } catch (error) {
          toast.error(error.response.data.message);
        } finally {
          set({ isMessagesLoading: false });
        }
      },

      sendMessage: async (messageData) => {
        const { selectedUser, messages } = get();
        try {
          const res = await axiosInstance.post(
            `/messages/send/${selectedUser?._id}`,
            messageData
          );
          set({ messages: [...messages, res.data] });
        } catch (error) {
          toast.error(error.response.data.message);
        }
      },

      // ✅ FIXED: Notifications should now always appear when no chat is selected
      subscribeToMessages: () => {
        console.log("✅ Subscribing to messages...");
        const socket = useAuthStore.getState().socket;

        if (!socket) {
          console.error("❌ Socket not found!");
          return;
        }

        // ✅ Remove existing listeners to prevent duplication
        socket.off("newMessage");

        socket.on("newMessage", (newMessage) => {
          console.log("🔔 New message received:", newMessage);

          let selectedUser = get().selectedUser;

          // ✅ If `selectedUser` is undefined (not rehydrated), set it to null
          if (selectedUser === undefined) {
            console.log("⚠️ selectedUser was undefined, setting to null...");
            set({ selectedUser: null });
            selectedUser = null;
          }

          console.log("🔎 Selected user after check:", selectedUser);

          // ✅ If no chat is selected, ALWAYS show notification
          if (!selectedUser) {
            console.log("📢 No chat selected, adding notification.");

            set((state) => ({
              notifications: [...state.notifications, newMessage],
            }));

            // ✅ Trigger a state update to force notifications to re-render
            set({ notifications: [...get().notifications] });

            return;
          }

          // ✅ If a chat is open, check if it's the same sender
          const isChatOpen = newMessage.senderId === selectedUser._id;

          if (!isChatOpen) {
            console.log("📢 Different chat selected, adding notification.");
            set((state) => ({
              notifications: [...state.notifications, newMessage],
            }));
          } else {
            console.log(
              "💬 Message received in open chat, not adding notification."
            );
            set({ messages: [...get().messages, newMessage] });
          }
        });
      },

      unsubscribeFromMessages: () => {
        const socket = useAuthStore.getState().socket;
        if (socket) {
          socket.off("newMessage");
          console.log("❌ Unsubscribed from messages");
        }
      },

      setSelectedUser: (selectedUser) => {
        console.log("✅ Selected user changed:", selectedUser);
        set((state) => ({
          selectedUser,
          notifications: state.notifications.filter(
            (notif) => notif.senderId !== selectedUser?._id
          ),
        }));
      },

      clearNotifications: () => {
        set({ notifications: [] });
      },

      // ✅ FIX: Ensure Zustand properly logs `selectedUser` after reload
      setHasHydrated: () => {
        console.log(
          "✅ Zustand has rehydrated! Setting `selectedUser` to null..."
        );
        set({ hasHydrated: true, selectedUser: null }); // ✅ Reset `selectedUser`
      },

      // ✅ Force a Zustand re-render on every page reload
      resetSelectedUser: () => {
        console.log("🔄 Force resetting selectedUser on page load...");
        set({ selectedUser: null });

        // ✅ Ensure Zustand updates state properly
        set((state) => ({ ...state }));

        console.log("✅ selectedUser is now:", get().selectedUser);
      },
    }),
    {
      name: "chat-notifications-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ notifications: state.notifications }),
      onRehydrateStorage: () => (state) => {
        console.log("🔥 Zustand rehydration triggered.");
        state.setHasHydrated();

        // ✅ Force a refresh after Zustand rehydration
        setTimeout(() => {
          state.resetSelectedUser();
        }, 50);
      },
    }
  )
);
