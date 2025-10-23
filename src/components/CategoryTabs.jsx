import React from "react";

export default function CategoryTabs({ categories, active, onChange }) {
  return (
    <div className="w-full overflow-x-auto mt-4 pb-2">
      <div className="flex gap-2 min-w-max">
        {categories.map((cat) => {
          const isActive = cat === active;
          return (
            <button
              key={cat}
              onClick={() => onChange(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? "bg-sky-500 text-white shadow-sm"
                  : "bg-slate-100 hover:bg-sky-100 text-slate-700"
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>
    </div>
  );
}