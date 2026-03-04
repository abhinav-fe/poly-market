"use client";
import { useState } from "react";
import { useApp } from "@/store/AppContext";
import AuthGuard        from "@/components/auth/AuthGuard";
import CategoryFilter   from "@/components/event/CategoryFilter";
import EventList        from "@/components/event/EventList";

export default function FeedPage() {
  const { events, setModal } = useApp();
  const [cat, setCat] = useState("All");
  const filtered = events.filter(e => cat === "All" || e.category === cat);

  return (
    <AuthGuard>
      <div className="px-4 pb-24 relative">
        <CategoryFilter active={cat} onChange={setCat} />
        <EventList events={filtered} />
        <button onClick={() => setModal({ type: "create" })}
          className="fixed bottom-6 right-5 z-40 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full px-5 py-3 shadow-xl flex items-center gap-2">
          <span className="text-lg">+</span> Create Event
        </button>
      </div>
    </AuthGuard>
  );
}
