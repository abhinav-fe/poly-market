"use client";
import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { updateEvent } from "@/lib/firestore";
import { CATEGORIES } from "@/constants";

export default function EditEventModal({ event, hasPredictions, onClose }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    title:    event.title,
    category: event.category,
    endsAt:   event.endsAt,
    tags:     event.tags?.join(", ") || "",
    opt1:     event.options?.[0]?.label || "",
    opt2:     event.options?.[1]?.label || "",
  });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    if (!form.title || !form.endsAt) { setError("Title and end date are required"); return; }
    setLoading(true);
    setError("");
    try {
      const updates = {
        title:    form.title,
        category: form.category,
        endsAt:   form.endsAt,
        tags:     form.tags.split(",").map(t => t.trim()).filter(Boolean),
      };
      // Only update options if no predictions yet
      if (!hasPredictions) {
        updates.options = [
          { ...event.options[0], label: form.opt1 },
          { ...event.options[1], label: form.opt2 },
        ];
      }
      await updateEvent(event.id, updates, user.uid);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center px-4"
      onClick={onClose}>
      <div className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-2xl p-5"
        onClick={e => e.stopPropagation()}>

        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-base">✏️ Edit Event</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">×</button>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          {/* Title */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Event question</label>
            <input value={form.title} onChange={e => set("title", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>

          {/* Category + End date */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Category</label>
              <select value={form.category} onChange={e => set("category", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none">
                {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Ends on</label>
              <input type="date" value={form.endsAt} onChange={e => set("endsAt", e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
            </div>
          </div>

          {/* Options — disabled if predictions exist */}
          <div className="flex gap-2">
            {["opt1","opt2"].map((k, i) => (
              <div key={k} className="flex-1">
                <label className="text-xs text-gray-400 mb-1 block">
                  Option {i+1} {hasPredictions && <span className="text-amber-500">(locked)</span>}
                </label>
                <input value={form[k]} onChange={e => set(k, e.target.value)}
                  disabled={hasPredictions}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed" />
              </div>
            ))}
          </div>
          {hasPredictions && (
            <p className="text-xs text-amber-500/80">⚠️ Options are locked because predictions have been placed.</p>
          )}

          {/* Tags */}
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Tags (comma separated)</label>
            <input value={form.tags} onChange={e => set("tags", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-1">
            <button onClick={onClose}
              className="flex-1 py-2.5 rounded-xl bg-gray-800 text-gray-400 text-sm font-semibold hover:bg-gray-700">
              Cancel
            </button>
            <button onClick={handleSave} disabled={loading}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold">
              {loading ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
