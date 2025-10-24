import React, { useState } from "react";

/**
 * Responsive SearchBar
 * - input + button live inside the same rounded gradient capsule
 * - on very small screens (<=320px) the button shows icon-only (text hidden)
 * - uses existing `animate-gradient` CSS class for the ring
 */
export default function SearchBar({ onSearch, placeholder = "Try 'High-end Builds', 'Parts'" }) {
  const [q, setQ] = useState("");

  function submit(e) {
    e?.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  }

  return (
    <form
      onSubmit={submit}
      className="w-full max-w-4xl mx-auto px-3 md:px-0 mt-4"
      aria-label="Search form"
    >
      {/* Outer gradient ring */}
      <div className="animate-gradient p-[2px] rounded-full">
        {/* Inner white capsule (holds icon + input + button) */}
        <div className="bg-white flex items-center rounded-full shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden">
          {/* Left search icon (always visible) */}
          <svg
            className="w-5 h-5 text-slate-400 ml-4 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M21 21l-4.35-4.35"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="11"
              cy="11"
              r="6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Input */}
          <input
            id="search-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            aria-label="Search"
            className="flex-1 min-w-0 px-3 py-2 md:py-3 text-sm md:text-base text-slate-700 bg-transparent placeholder:text-slate-400 outline-none"
          />

          {/* Button inside the same capsule */}
          <button
            type="submit"
            className="h-full px-4 md:px-5 py-2 md:py-3 text-sm md:text-base font-medium bg-sky-500 text-white hover:bg-sky-600 active:scale-[0.97] transition-all duration-200 rounded-full mr-2 md:mr-3 flex items-center gap-2 shrink-0"
            aria-label="Search"
          >
            {/* text label (hidden on very small screens) */}
            <span className="btn-text hidden sm:inline">Search</span>

            {/* icon (always present visually; when text hidden only icon remains) */}
            <svg
              className="btn-icon w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}