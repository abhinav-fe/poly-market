"use client";
import { CATEGORIES } from "@/constants";
export default function CategoryFilter({ active, onChange }) {
  return (
    <div className="flex gap-2 overflow-x-auto py-3">
      {CATEGORIES.map(c => (
        <button key={c} onClick={() => onChange(c)}
          className={`whitespace-nowrap px-3 py-1 rounded-full text-xs font-semibold border transition-all ${active === c ? "bg-indigo-600 border-indigo-500 text-white" : "bg-gray-800 border-gray-700 text-gray-400"}`}>
          {c}
        </button>
      ))}
    </div>
  );
}
