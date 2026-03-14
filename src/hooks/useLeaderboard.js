"use client";
import { useEffect, useState } from "react";
import { subscribeLeaderboard } from "@/lib/firestore";

export function useLeaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    const unsub = subscribeLeaderboard((data) => {
      setLeaderboard(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return { leaderboard, loading };
}
