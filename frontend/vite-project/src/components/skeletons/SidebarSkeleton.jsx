import { Users } from "lucide-react";

const SidebarSkeleton = () => {
  const skeletonContacts = Array(8).fill(null);

  return (
    <aside
      className="h-full w-24 lg:w-80 border-r border-base-300 
      flex flex-col transition-all duration-200 bg-base-100 shadow-lg rounded-2xl"
    >
      {/* Header */}
      <div className="border-b border-base-300 w-full p-5 bg-base-200 flex justify-between items-center rounded-t-2xl">
        <div className="flex items-center gap-2">
          <Users className="w-7 h-7 text-primary" />
          <span className="font-semibold text-xl text-primary hidden lg:block">
            Contacts
          </span>
        </div>
      </div>

      {/* Skeleton Contacts */}
      <div className="overflow-y-auto w-full py-4">
        {skeletonContacts.map((_, idx) => (
          <div
            key={idx}
            className="w-full p-4 flex items-center gap-4 animate-pulse 
            hover:bg-base-200 rounded-xl transition-all duration-150 ease-in-out"
          >
            {/* Avatar skeleton */}
            <div className="relative mx-auto lg:mx-0">
              <div className="h-12 w-12 bg-gray-300 rounded-full shadow-md" />
            </div>

            {/* User info skeleton - visible only on large screens */}
            <div className="hidden lg:flex flex-col justify-center flex-1">
              <div className="h-5 w-36 bg-gray-300 rounded-lg mb-2" />
              <div className="h-3 w-20 bg-gray-300 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
};

export default SidebarSkeleton;
