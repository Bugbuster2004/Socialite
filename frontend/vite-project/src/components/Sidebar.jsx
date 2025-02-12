import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import { Users } from "lucide-react";

const Sidebar = () => {
  const { getUsers, users, selectedUser, setSelectedUser, isUsersLoading } =
    useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);

  useEffect(() => {
    getUsers();
  }, [getUsers]);

  const filteredUsers = showOnlineOnly
    ? users.filter((user) => onlineUsers.includes(user._id))
    : users;

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <aside className="h-full w-20 lg:w-72 border-r border-base-300 flex flex-col transition-all duration-200 bg-base-100 shadow-lg rounded-2xl">
      {/* Header Section */}
      <div className="border-b border-base-300 w-full p-5 bg-base-200 flex justify-between items-center rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          <span className="font-semibold text-lg text-primary hidden lg:block">
            Contacts
          </span>
        </div>
      </div>

      {/* Online Filter Toggle */}
      <div className="mt-3 hidden lg:flex items-center gap-3 px-5">
        <label className="cursor-pointer flex items-center gap-2">
          <input
            type="checkbox"
            checked={showOnlineOnly}
            onChange={(e) => setShowOnlineOnly(e.target.checked)}
            className="checkbox checkbox-sm"
          />
          <span className="text-sm text-gray-700">Show online only</span>
        </label>
        <span className="text-xs text-zinc-500">
          ({onlineUsers.length - 1} online)
        </span>
      </div>

      {/* User List */}
      <div className="overflow-y-auto w-full py-3">
        {filteredUsers.map((user) => (
          <button
            key={user._id}
            onClick={() => setSelectedUser(user)}
            className={`
              w-full p-4 flex items-center gap-3 rounded-xl transition-all duration-150 ease-in-out
              hover:bg-base-300 
              ${
                selectedUser?._id === user._id
                  ? "bg-base-300 ring-1 ring-primary"
                  : ""
              }
            `}
          >
            {/* Profile Picture */}
            <div className="relative mx-auto lg:mx-0">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={user.name}
                className="h-12 w-12 object-cover rounded-full shadow-md"
              />
              {onlineUsers.includes(user._id) && (
                <span
                  className="absolute bottom-0 right-0 h-3 w-3 bg-green-500 
                  rounded-full ring-2 ring-base-100"
                />
              )}
            </div>

            {/* User Info (visible only on larger screens) */}
            <div className="hidden lg:block text-left min-w-0">
              <div className="font-medium truncate">{user.fullName}</div>
              <div className="text-sm text-gray-500">
                {onlineUsers.includes(user._id) ? "Online" : "Offline"}
              </div>
            </div>
          </button>
        ))}

        {/* Empty State */}
        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-500 py-6">
            {showOnlineOnly ? "No online users" : "No users found"}
          </div>
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
