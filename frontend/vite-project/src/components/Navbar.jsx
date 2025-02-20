import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  Bell,
  HelpCircle,
} from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";

// Initialize socket
const socket = io(import.meta.env.VITE_BACKEND_URL, {
  query: { userId: useAuthStore.getState().authUser?._id },
});

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const {
    notifications,
    setSelectedUser,
    subscribeToMessages,
    unsubscribeFromMessages,
    clearNotifications,
    hasHydrated,
    users,
  } = useChatStore();
  const { resetSelectedUser } = useChatStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Reset selected user on initial load
  useEffect(() => {
    console.log("Resetting selectedUser on Navbar mount");
    resetSelectedUser();
  }, []);

  // Subscribe to messages after Zustand rehydrates
  useEffect(() => {
    if (!hasHydrated) return;
    console.log("✅ Zustand has rehydrated. Subscribing to messages...");
    subscribeToMessages();
    return () => {
      console.log("❌ Unsubscribing from messages...");
      unsubscribeFromMessages();
    };
  }, [hasHydrated]);

  return (
    <header className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg bg-base-100/80 shadow-md">
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* Logo Section */}
          <div className="flex items-center gap-8">
            <Link
              to="/"
              className="flex items-center gap-2.5 hover:opacity-80 transition-all"
            >
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Player
                  autoplay
                  loop
                  src="/lottie/chat.json"
                  style={{ height: "36px", width: "36px" }}
                />
              </div>
              <h1 className="text-lg font-bold">SOCIALITE</h1>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {/* Messages Button */}
            <Link
              to="/"
              className="btn btn-sm gap-2 hover:bg-primary/10 transition-all relative group"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Messages</span>
            </Link>

            {/* Notifications Dropdown using DaisyUI */}
            <details className="dropdown dropdown-end relative">
              <summary className="btn btn-sm gap-2 hover:bg-primary/10 transition-all">
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="badge badge-sm indicator-item">
                    {notifications.length}
                  </span>
                )}
              </summary>

              {/* Dropdown Content */}
              <div className="dropdown-content bg-base-100 rounded-box w-60 p-2 shadow max-h-24 overflow-y-auto overflow-x-hidden">
                <h2 className="text-lg font-semibold px-4 py-2">
                  Notifications
                </h2>

                <ul className="flex flex-col gap-1">
                  {notifications.length === 0 ? (
                    <li className="px-4 py-3 text-gray-500">No new messages</li>
                  ) : (
                    notifications.map((notif) => {
                      const foundUser = users.find(
                        (u) => u._id === notif.senderId
                      );

                      const displayName = foundUser
                        ? foundUser.fullName
                        : notif.senderId;

                      return (
                        <li
                          key={notif._id}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer rounded-md"
                          onClick={() => setSelectedUser(notif.senderId)}
                        >
                          <span className="text-sm font-medium">
                            New message from{" "}
                            <strong>
                              <i>{displayName}</i>{" "}
                            </strong>
                          </span>
                        </li>
                      );
                    })
                  )}
                </ul>

                {/* Clear All Button */}
                {notifications.length > 0 && (
                  <button
                    className="btn btn-xs btn-error w-full mt-2"
                    onClick={clearNotifications}
                  >
                    Clear All
                  </button>
                )}
              </div>
            </details>

            {/* Settings */}
            <Link
              to="/settings"
              className="btn btn-sm gap-2 hover:bg-primary/10 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {/* Profile Dropdown */}
            {authUser && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="btn btn-sm gap-2 hover:bg-primary/10 transition-all"
                >
                  <User className="size-5" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white shadow-lg rounded-md overflow-hidden z-50">
                    <ul className="divide-y divide-gray-200">
                      <li>
                        <Link
                          to="/profile"
                          className="flex items-center px-4 py-3 hover:bg-gray-100"
                        >
                          <User className="w-4 h-4 mr-2" />
                          View Profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          to="/help"
                          className="flex items-center px-4 py-3 hover:bg-gray-100"
                        >
                          <HelpCircle className="w-4 h-4 mr-2" />
                          Help Center
                        </Link>
                      </li>
                      <li>
                        <button
                          onClick={logout}
                          className="flex items-center px-4 py-3 w-full text-left hover:bg-gray-100"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
