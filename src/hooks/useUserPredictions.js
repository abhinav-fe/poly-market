"use client";
import { useEffect, useState } from "react";
import { getUserPredictions } from "@/lib/firestore";

export function useUserPredictions(uid) {
  const [predictions, setPredictions] = useState([]);
  const [loading,     setLoading]     = useState(true);

  useEffect(() => {
    if (!uid) return;
    getUserPredictions(uid).then((data) => {
      setPredictions(data);
      setLoading(false);
    });
  }, [uid]);

  return { predictions, loading };
}
