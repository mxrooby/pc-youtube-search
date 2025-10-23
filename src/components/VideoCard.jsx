import React from "react";

export default function VideoCard({ item, onSelect }) {
  // Prefer real YouTube id when available
  const playerId = item.youtubeId || item.videoId || item.id;

  // Friendly fallbacks for fields
  const channel = item.channelName || item.channel || "Unknown channel";
  const published = item.uploadDate || item.publishedAt || "";

  return (
    <div
      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 hover:border-sky-300 cursor-pointer"
      onClick={() => onSelect(playerId)}
    >
      {/* Thumbnail / Video Section */}
      <div className="relative">
        {/* Responsive 16:9 Wrapper */}
        <div className="relative w-full pt-[56.25%] overflow-hidden bg-black">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="absolute top-0 left-0 w-full h-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Featured Tag */}
        {item.featured && (
          <span className="absolute left-2 top-2 bg-sky-500 text-white text-xs px-2 py-0.5 rounded-full shadow-sm">
            Featured
          </span>
        )}

        {/* Duration */}
        {item.duration && (
          <span className="absolute right-2 bottom-2 bg-black/80 text-white text-xs px-2 py-0.5 rounded">
            {item.duration}
          </span>
        )}

        {/* Play Button Overlay */}
        <button
          onClick={() => onSelect(playerId)}
          className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300"
          aria-label={`Play ${item.title}`}
        >
          <div className="bg-white/90 p-3 rounded-full shadow-md">
            <svg
              className="w-8 h-8 text-sky-500"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M5 3v18l15-9z" />
            </svg>
          </div>
        </button>
      </div>

      {/* Video Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 hover:text-sky-600 transition-colors duration-200">
          {item.title}
        </h3>

        <div className="mt-2 flex flex-col text-xs text-slate-500 space-y-1">
          <div>{channel}</div>
          <div>
            {published ? String(published) : ""} • {item.views ?? "—"}
          </div>
        </div>
      </div>
    </div>
  );
}