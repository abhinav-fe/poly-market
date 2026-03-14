"use client";
import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { deleteEvent, archiveEvent } from "@/lib/firestore";

export default function DeleteConfirmModal({ event, onClose }) {
  const { user }    = useAuth();
  const [loading,   setLoading]   = useState(null); // 'archive' | 'delete'
  const [error,     setError]     = useState("");

  const handle = async (action) => {
    setLoading(action);
    setError("");
    try {
      if (action === "archive") await archiveEvent(event.id, user.uid);
      if (action === "delete")  await deleteEvent(event.id, user.uid);
      onClose();
    } catch (err) {
      setError(err.message);
      setLoading(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-black/70 flex items-center justify-center px-4"
      onClick={onClose}>
      <div className="w-full max-w-sm bg-gray-900 border border-gray-700 rounded-2xl p-5"
        onClick={e => e.stopPropagation()}>

        <div className="text-center mb-4">
          <div className="text-4xl mb-2">🗑️</div>
          <h3 className="font-bold text-base">Remove Event</h3>
          <p className="text-xs text-gray-400 mt-1 leading-snug">"{event.title}"</p>
        </div>

        {error && (
          <div className="mb-3 px-3 py-2 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-xs">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {/* Archive */}
          <button onClick={() => handle("archive")} disabled={!!loading}
            className="w-full py-3 rounded-xl bg-amber-900/40 border border-amber-700/50 hover:bg-amber-900/60 text-amber-300 text-sm font-semibold disabled:opacity-50 transition-all">
            {loading === "archive" ? "Archiving..." : "📦 Archive (hide from feed)"}
          </button>
          <p className="text-xs text-gray-600 text-center -mt-1">Hides the event but keeps all data</p>

          {/* Delete */}
          <button onClick={() => handle("delete")} disabled={!!loading}
            className="w-full py-3 rounded-xl bg-red-900/40 border border-red-700/50 hover:bg-red-900/60 text-red-300 text-sm font-semibold disabled:opacity-50 transition-all">
            {loading === "delete" ? "Deleting..." : "🗑️ Permanently delete"}
          </button>
          <p className="text-xs text-gray-600 text-center -mt-1">Cannot be undone</p>

          {/* Cancel */}
          <button onClick={onClose} disabled={!!loading}
            className="w-full py-3 rounded-xl bg-gray-800 text-gray-400 text-sm font-semibold hover:bg-gray-700 mt-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
