import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { useNotificationStore } from "../store/useNotificationStore";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import {
  LogOut,
  MessageSquare,
  Settings,
  User,
  Bell,
  HelpCircle,
  CheckCircle,
} from "lucide-react";
import { Player } from "@lottiefiles/react-lottie-player";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  query: { userId: useAuthStore.getState().authUser?._id },
});

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { notifications, fetchNotifications, markAsRead, addNotification } =
    useNotificationStore();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchNotifications(); // Fetch notifications initially

    socket.on("new_notification", (notification) => {
      console.log("New Notification Received:", notification);
      addNotification(notification); // Update state in real-time
    });

    return () => {
      socket.off("new_notification");
    };
  }, [addNotification]); // Ensure `addNotification` is in the dependency array

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
      backdrop-blur-lg bg-base-100/80 shadow-md"
    >
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
              to={"/messages"}
              className="btn btn-sm gap-2 hover:bg-primary/10 transition-all relative group"
            >
              <MessageSquare className="w-5 h-5" />
              <span className="hidden sm:inline">Messages</span>
            </Link>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="btn btn-sm gap-2 hover:bg-primary/10 transition-all relative group"
              >
                <Bell className="w-5 h-5" />
                <span className="hidden sm:inline">Notifications</span>
                {notifications.length > 0 && (
                  <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notifications Modal */}
              {isOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg max-h-72 overflow-y-auto p-3 z-50">
                  {notifications.length === 0 ? (
                    <p className="text-gray-500 text-center">
                      No new notifications
                    </p>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification._id}
                        className="flex justify-between items-center p-2 border-b"
                      >
                        <p className="text-sm">{notification.message}</p>
                        <button onClick={() => markAsRead(notification._id)}>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Settings */}
            <Link
              to={"/settings"}
              className="btn btn-sm gap-2 hover:bg-primary/10 transition-all"
            >
              <Settings className="w-4 h-4" />
              <span className="hidden sm:inline">Settings</span>
            </Link>

            {authUser && (
              <>
                {/* Profile Dropdown */}
                <div className="dropdown dropdown-end">
                  <label tabIndex={0} className="btn btn-sm gap-2">
                    <User className="size-5" />
                    <span className="hidden sm:inline">Profile</span>
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52"
                  >
                    <li>
                      <Link to="/profile">
                        <User className="w-4 h-4" /> View Profile
                      </Link>
                    </li>
                    <li>
                      <Link to="/help">
                        <HelpCircle className="w-4 h-4" /> Help Center
                      </Link>
                    </li>
                    <li>
                      <button onClick={logout}>
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
