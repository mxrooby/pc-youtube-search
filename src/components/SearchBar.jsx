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
      {/* Outer gradient border (unchanged color) */}
      <div className="rounded-full p-[3px] bg-gradient-to-r from-sky-400 via-blue-400 to-cyan-500 animate-gradient">
        {/* Inner white capsule */}
        <div className="bg-white flex items-center rounded-full shadow-sm hover:shadow-md transition-all duration-300 px-4 py-[8px] sm:py-[10px]">
          {/* Left search icon (static icon beside input) */}
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

          {/* Search input */}
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={placeholder}
            aria-label="Search"
            className="flex-1 outline-none text-sm md:text-base text-slate-700 bg-transparent placeholder:text-slate-400"
          />

          {/* Icon-only Search Button */}
          <button
            type="submit"
            aria-label="Search"
            className="ml-3 p-2.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white shadow hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"
              />
            </svg>
          </button>
        </div>
      </div>
    </form>
  );
}