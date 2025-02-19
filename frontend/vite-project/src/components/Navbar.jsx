//this is navbar
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
  X,
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
    // ✅ FIX: Extract hasHydrated from Zustand store
  } = useChatStore();
  const { resetSelectedUser } = useChatStore();
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  useEffect(() => {
    console.log("hello i am rese fncn from navabr useffect");
    resetSelectedUser(); // ✅ Ensures `selectedUser` resets on every page load
  }, []);

  // ✅ Subscribe only when Zustand has fully rehydrated
  useEffect(() => {
    if (hasHydrated) {
      console.log("✅ Zustand has rehydrated. Subscribing to messages...");
      subscribeToMessages();
    }

    return () => {
      console.log("❌ Unsubscribing from messages...");
      unsubscribeFromMessages();
    };
  }, [hasHydrated]); // ✅ FIX: Ensures it runs when Zustand is ready

  console.log(notifications);
  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80 shadow-md"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          {/* ✅ Logo Section */}
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

          {/* ✅ Navigation Links */}
          <div className="flex items-center gap-4">
            {/* ✅ Messages Button */}
            <Link
              to={"/"}
              className="btn btn-sm gap-2 hover:bg-primary/10 transition-all relative group"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Messages</span>
            </Link>

            {/* ✅ Notifications Button */}
            <div className="relative">
              <button
                className="btn btn-sm gap-2 hover:bg-primary/10 transition-all relative group"
                onClick={() => setIsNotifOpen(!isNotifOpen)}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* ✅ Notifications Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white shadow-lg rounded-md overflow-hidden z-50">
                  <div className="flex justify-between items-center px-4 py-2 border-b border-gray-200">
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <button onClick={() => setIsNotifOpen(false)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <ul className="divide-y divide-gray-200">
                    {notifications.length === 0 ? (
                      <li className="px-4 py-3 text-gray-500">
                        No new messages
                      </li>
                    ) : (
                      notifications.map((notif) => (
                        <li
                          key={notif._id}
                          className="px-4 py-3 hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedUser(notif.senderId);
                            setIsNotifOpen(false);
                          }}
                        >
                          <span className="text-sm font-medium">
                            New message from {notif.senderId}
                          </span>
                        </li>
                      ))
                    )}
                  </ul>

                  {notifications.length > 0 && (
                    <button
                      className="w-full text-center py-2 bg-red-500 text-white"
                      onClick={clearNotifications}
                    >
                      Clear All
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* ✅ Settings */}
            <Link
              to={"/settings"}
              className="btn btn-sm gap-2 hover:bg-primary/10 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {/* ✅ Profile Dropdown */}
            {authUser && (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="btn btn-sm gap-2 hover:bg-primary/10 transition-all"
                >
                  <User className="size-5" />
                  <span className="hidden sm:inline">{authUser.name}</span>
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
