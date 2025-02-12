import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { X, PlayCircle } from "lucide-react";

const ChatMediaModal = ({ isOpen, onClose }) => {
  const { chatMedia, fetchChatMedia } = useChatStore();
  const [selectedMedia, setSelectedMedia] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchChatMedia();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      {/* Modal Container */}
      <div className="bg-white p-4 rounded-lg shadow-lg w-[90%] max-w-2xl h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center border-b pb-2">
          <h2 className="text-lg font-semibold">Shared Media</h2>
          <button onClick={onClose} className="p-2">
            <X className="w-6 h-6 text-gray-600 hover:text-black" />
          </button>
        </div>

        {/* Media Grid - Shows 6 Items in View, Rest Scrollable */}
        <div className="flex-1 overflow-y-auto mt-2">
          <div className="grid grid-cols-3 gap-2">
            {chatMedia.length > 0 ? (
              chatMedia.map((media, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer"
                  onClick={() => setSelectedMedia(media)}
                >
                  {/* Media Preview */}
                  {media.type === "video" ? (
                    <div className="relative">
                      <video
                        src={media.url}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      {/* Play Icon Overlay */}
                      <PlayCircle className="absolute top-2 right-2 text-white w-6 h-6 opacity-90 group-hover:opacity-100" />
                      {/* Video Duration */}
                      <span className="absolute bottom-1 right-1 bg-black bg-opacity-60 text-xs px-1 rounded text-white">
                        {media.duration}
                      </span>
                    </div>
                  ) : (
                    <img
                      src={media.image}
                      alt="Shared Media"
                      className="w-full h-24 object-cover rounded-md"
                    />
                  )}

                  {/* GIF Tag */}
                  {media.type === "gif" && (
                    <span className="absolute bottom-1 left-1 bg-black bg-opacity-60 text-xs px-1 rounded text-white">
                      GIF
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center col-span-3">
                No media found
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Fullscreen Preview */}
      {selectedMedia && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          onClick={() => setSelectedMedia(null)}
        >
          <button
            className="absolute top-4 right-4 text-white"
            onClick={() => setSelectedMedia(null)}
          >
            <X className="w-8 h-8" />
          </button>
          {selectedMedia.type === "video" ? (
            <video
              controls
              src={selectedMedia.url}
              className="max-w-full max-h-full"
            />
          ) : (
            <img
              src={selectedMedia.image}
              alt="Media Preview"
              className="max-w-full max-h-full"
            />
          )}
        </div>
      )}
    </div>
  );
};

export default ChatMediaModal;
