import { useState } from "react";
import ChatMediaModal from "./ChatMediaModal";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
// import { selectedUser } from "../store/useChatStore.js";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!selectedUser) return null;

  return (
    <>
      {/* Chat Header */}
      <div
        className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shadow-md rounded-t-xl cursor-pointer"
        onClick={() => setIsModalOpen(true)} // Open modal on click
      >
        <div className="flex items-center gap-4">
          <div className="relative w-12 h-12">
            <img
              src={selectedUser.profilePic || "/avatar.png"}
              alt={selectedUser.fullName}
              className="w-full h-full rounded-full object-cover shadow-md"
            />
            <span
              className={`absolute bottom-1 right-1 h-3 w-3 rounded-full border-2 border-white ${
                onlineUsers.includes(selectedUser._id)
                  ? "bg-green-500"
                  : "bg-gray-400"
              }`}
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
              {selectedUser.fullName}
            </h3>
            <p className="text-sm text-gray-500">
              {onlineUsers.includes(selectedUser._id) ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Media Modal */}
      <ChatMediaModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};

export default ChatHeader;
