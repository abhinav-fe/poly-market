"use client";
import { useApp } from "@/store/AppContext";
export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;
  return (
    <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-5 py-2 rounded-full text-sm font-semibold shadow-lg ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
      {toast.msg}
    </div>
  );
}
