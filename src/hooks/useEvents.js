"use client";
import { useEffect, useState } from "react";
import { subscribeEvents } from "@/lib/firestore";

export function useEvents() {
  const [events,  setEvents]  = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = subscribeEvents((data) => {
      setEvents(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { events, loading };
}
