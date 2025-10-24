import React, { useState } from "react";

export default function SearchBar({ onSearch, placeholder = "Try 'High-end Builds', 'Parts'" }) {
  const [q, setQ] = useState("");

  function submit(e) {
    e?.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) return;
    onSearch(trimmed);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-4xl mx-auto mt-4 px-4">
      {/* Outer animated gradient border (same colors as before) */}
      <div className="animate-gradient p-[3px] rounded-full">
        <div className="bg-white flex items-center rounded-full shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden px-4 py-[6px] sm:py-[8px]">
          {/* Search icon */}
          <svg
            className="w-5 h-5 text-slate-400 mr-3 flex-shrink-0"
            viewBox="0 0 24 24"
            fill="none"
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

          {/* Input field */}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            aria-label="Search"
            className="flex-1 outline-none text-sm md:text-base text-slate-700 bg-transparent placeholder:text-slate-400"
          />

          {/* Button */}
          <button
            type="submit"
            className="ml-3 px-5 py-2 rounded-full text-sm font-medium bg-sky-500 text-white shadow hover:bg-sky-600 hover:scale-105 transition-all duration-200"
          >
            Search
          </button>
        </div>
      </div>
    </form>
  );
}