"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { postComment, subscribeComments } from "@/lib/firestore";

export default function CommentSection({ eventId }) {
  const { user }    = useAuth();
  const [comments, setComments] = useState([]);
  const [text,     setText]     = useState("");
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    const unsub = subscribeComments(eventId, setComments);
    return () => unsub();
  }, [eventId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!text.trim() || !user) return;
    setLoading(true);
    try {
      await postComment(eventId, text.trim(), user);
      setText("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-800 pt-4">
      <h4 className="text-xs font-semibold text-gray-400 uppercase mb-3">
        💬 Comments ({comments.length})
      </h4>

      {/* Comment list */}
      <div className="flex flex-col gap-3 mb-4 max-h-48 overflow-y-auto">
        {comments.length === 0 && (
          <p className="text-xs text-gray-600">No comments yet. Be first!</p>
        )}
        {comments.map(c => (
          <div key={c.id} className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-indigo-800 flex items-center justify-center text-xs font-bold shrink-0">
              {c.photoURL
                ? <img src={c.photoURL} className="w-6 h-6 rounded-full" alt="" />
                : (c.displayName || "U")[0].toUpperCase()
              }
            </div>
            <div>
              <span className="text-xs font-semibold text-indigo-300">{c.displayName} </span>
              <span className="text-xs text-gray-300">{c.text}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      {user && (
        <form onSubmit={handlePost} className="flex gap-2">
          <input value={text} onChange={e => setText(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500" />
          <button type="submit" disabled={loading || !text.trim()}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-xs font-semibold">
            Post
          </button>
        </form>
      )}
    </div>
  );
}
