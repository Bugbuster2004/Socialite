import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  chatMedia: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

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
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  // Edit Message
  editMessage: async (messageId, updatedText) => {
    const { messages } = get();
    try {
      // Send the edit request to the server
      const res = await axiosInstance.patch(`/messages/${messageId}/edit`, {
        text: updatedText,
      });

      // Update the message in the store
      set({
        messages: messages.map((message) =>
          message._id === messageId
            ? { ...message, text: updatedText, editedAt: res.data.editedAt }
            : message
        ),
      });

      toast.success("Message edited successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  // Delete Message
  deleteMessage: async (messageId) => {
    const { messages } = get();
    try {
      // Send the delete request to the server
      await axiosInstance.delete(`/messages/${messageId}`);

      // Remove the message from the store
      set({
        messages: messages.filter((message) => message._id !== messageId),
      });

      toast.success("Message deleted successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },
  //fetch chat media from the chat
  fetchChatMedia: async () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    try {
      const res = await axiosInstance.get(
        `/messages/media/${selectedUser._id}`
      );
      set({ chatMedia: res.data });
    } catch (error) {
      // console.error("Error fetching chat media:", error);
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;

    const socket = useAuthStore.getState().socket;

    socket.on("newMessage", (newMessage) => {
      const isMessageSentFromSelectedUser =
        newMessage.senderId === selectedUser._id;
      if (!isMessageSentFromSelectedUser) return;

      set({
        messages: [...get().messages, newMessage],
      });
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),

  addReaction: (messageId, reaction) => {
    set((state) => ({
      messages: state.messages.map((message) =>
        message._id === messageId
          ? {
              ...message,
              reactions: [...(message.reactions || []), reaction].slice(0, 5),
            }
          : message
      ),
    }));
  },
}));
