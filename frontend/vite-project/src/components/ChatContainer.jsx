import { useChatStore } from "../store/useChatStore";
import { useEffect, useRef, useState } from "react";
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessageSkeleton from "./skeletons/MessageSkeleton";
import { useAuthStore } from "../store/useAuthStore";
import { formatMessageTime } from "../lib/utils";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data"; // Emoji data
import { Smile } from "lucide-react";

const ChatContainer = () => {
  const {
    messages,
    getMessages,
    isMessagesLoading,
    selectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    addReaction,
    editMessage,
    deleteMessage,
  } = useChatStore();
  const { authUser } = useAuthStore();

  const messageEndRef = useRef(null);
  const contextMenuRef = useRef(null);
  const [isReactionPickerOpen, setIsReactionPickerOpen] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState(null);
  const [editedMessage, setEditedMessage] = useState("");
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    messageId: null,
    senderId: null,
  });

  useEffect(() => {
    getMessages(selectedUser._id);
    subscribeToMessages();
    return () => unsubscribeFromMessages();
  }, [
    selectedUser._id,
    getMessages,
    subscribeToMessages,
    unsubscribeFromMessages,
  ]);

  useEffect(() => {
    if (messageEndRef.current && messages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Handle clicks outside context menu to close it
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target)
      ) {
        setContextMenu((prevContextMenu) => ({
          ...prevContextMenu,
          visible: false,
        }));
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleRightClick = (e, messageId, messageText, senderId) => {
    e.preventDefault();
    // Show context menu only if the message belongs to the logged-in user
    if (senderId === authUser._id) {
      setContextMenu({
        visible: true,
        x: e.clientX,
        y: e.clientY,
        messageId,
        senderId,
      });
      setEditedMessage(messageText);
    }
  };

  const handleEditMessage = () => {
    if (editedMessage.trim() === "") return;
    editMessage(contextMenu.messageId, editedMessage);
    setEditedMessage("");
    setContextMenu({ ...contextMenu, visible: false });
    setActiveMessageId(null);
  };

  const handleDeleteMessage = () => {
    deleteMessage(contextMenu.messageId);
    setContextMenu({ ...contextMenu, visible: false });
  };

  const handleCancelEdit = () => {
    setEditedMessage("");
    setContextMenu({ ...contextMenu, visible: false });
    setActiveMessageId(null);
  };

  if (isMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <ChatHeader />
        <MessageSkeleton />
        <MessageInput />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <ChatHeader />

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message._id}
            className={`chat ${
              message.senderId === authUser._id ? "chat-end" : "chat-start"
            }`}
            ref={messageEndRef}
            onContextMenu={(e) =>
              handleRightClick(e, message._id, message.text, message.senderId)
            }
          >
            <div className="chat-image avatar">
              <div className="size-10 rounded-full border">
                <img
                  src={
                    message.senderId === authUser._id
                      ? authUser.profilePic || "/avatar.png"
                      : selectedUser.profilePic || "/avatar.png"
                  }
                  alt="profile pic"
                />
              </div>
            </div>
            <div className="chat-header mb-1">
              <time className="text-xs opacity-50 ml-1">
                {formatMessageTime(message.createdAt)}
              </time>
            </div>

            <div className="chat-bubble flex flex-col">
              {/* Edit Mode */}
              {activeMessageId === message._id ? (
                <div className="flex flex-col">
                  <input
                    type="text"
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleEditMessage()}
                    className="border p-2 rounded mb-2 bg-gray-200 text-black"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleEditMessage}
                      className="btn btn-sm btn-primary"
                    >
                      Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="btn btn-sm btn-secondary"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Normal Message View */}
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Attachment"
                      className="sm:max-w-[200px] rounded-md mb-2"
                    />
                  )}
                  {message.text && <p>{message.text}</p>}
                </>
              )}

              {/* Display Reactions */}
              {message.reactions && message.reactions.length > 0 && (
                <div className="mt-2 flex gap-1">
                  {message.reactions.map((reaction, index) => (
                    <span
                      key={index}
                      className="text-sm rounded-full px-2 py-1 bg-base-200"
                    >
                      {reaction}
                    </span>
                  ))}
                </div>
              )}

              {/* Reaction Button */}
              <div className="relative group">
                <button
                  className="absolute top-1/2 right-2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => {
                    setActiveMessageId(message._id);
                    setIsReactionPickerOpen((prev) => !prev);
                  }}
                >
                  <Smile className="w-5 h-5 text-primary" />
                </button>

                {isReactionPickerOpen && activeMessageId === message._id && (
                  <div className="absolute top-full right-0 z-10 bg-white shadow-lg">
                    <Picker
                      data={data}
                      onEmojiSelect={(emoji) => {
                        addReaction(message._id, emoji.native);
                        setIsReactionPickerOpen(false);
                      }}
                      theme="light"
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Context Menu for Edit and Delete */}
        {contextMenu.visible && (
          <div
            ref={contextMenuRef}
            style={{ left: contextMenu.x, top: contextMenu.y }}
            className="absolute bg-white border rounded shadow-md p-2 space-y-2 z-50"
          >
            <button
              onClick={() => {
                setActiveMessageId(contextMenu.messageId);
                setEditedMessage(
                  messages.find((msg) => msg._id === contextMenu.messageId).text
                );
              }}
              className="w-full text-left text-sm text-blue-600"
            >
              Edit Message
            </button>
            <button
              onClick={handleDeleteMessage}
              className="w-full text-left text-sm text-red-600"
            >
              Delete Message
            </button>
          </div>
        )}
      </div>

      <MessageInput />
    </div>
  );
};

export default ChatContainer;
