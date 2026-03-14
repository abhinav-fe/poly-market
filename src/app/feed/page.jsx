"use client";
import { useState, useEffect } from "react";
import { useAuth }   from "@/store/AuthContext";
import { useApp }    from "@/store/AppContext";
import { useEvents } from "@/hooks/useEvents";
import { predsCol }  from "@/lib/firestore";
import { getDocs }   from "firebase/firestore";
import AuthGuard        from "@/components/auth/AuthGuard";
import CategoryFilter   from "@/components/event/CategoryFilter";
import EventCard        from "@/components/event/EventCard";

export default function FeedPage() {
  const { user }               = useAuth();
  const { setModal }           = useApp();
  const { events, loading }    = useEvents();
  const [cat, setCat]          = useState("All");
  const [myPreds, setMyPreds]  = useState({}); // { eventId: predData }

  // Load current user's predictions for all events
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const map = {};
      for (const e of events) {
        const snap = await getDocs(predsCol(e.id));
        const mine = snap.docs.find(d => d.id === user.uid);
        if (mine) map[e.id] = mine.data();
      }
      setMyPreds(map);
    };
    if (events.length) load();
  }, [events, user]);

  const filtered = events.filter(e => cat === "All" || e.category === cat);

  return (
    <AuthGuard>
      <div className="px-4 pb-24 relative">
        <CategoryFilter active={cat} onChange={setCat} />
        {loading ? (
          <div className="flex flex-col gap-4">
            {[1,2,3].map(i => <div key={i} className="h-48 rounded-2xl bg-gray-800 animate-pulse" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center text-gray-500 py-16">No events yet. Create one!</div>
        ) : (
          <div className="flex flex-col gap-4">
            {filtered.map(e => <EventCard key={e.id} event={e} myPrediction={myPreds[e.id]} />)}
          </div>
        )}
        <button onClick={() => setModal({ type: "create" })}
          className="fixed bottom-6 right-5 z-40 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full px-5 py-3 shadow-xl flex items-center gap-2">
          <span className="text-lg">+</span> Create Event
        </button>
      </div>
    </AuthGuard>
  );
}
