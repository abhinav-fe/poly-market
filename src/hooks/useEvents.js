"use client";
import { useEffect, useState } from "react";
import { subscribeEvents } from "@/lib/firestore";

export function useEvents({ showArchived = false } = {}) {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeEvents((data) => {
      // Filter out archived events unless explicitly requested
      const filtered = showArchived ? data : data.filter(e => !e.archived);
      setEvents(filtered);
      setLoading(false);
    });
    return () => unsub();
  }, [showArchived]);

  return { events, loading };
}
