"use client";
import { useState } from "react";
import ShareSheet from "./ShareSheet";

export default function ShareButton({ payload, label = "Share", className = "", icon = "📤" }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button onClick={() => setOpen(true)}
        className={`flex items-center gap-1.5 ${className}`}>
        <span>{icon}</span>
        {label && <span>{label}</span>}
      </button>
      {open && <ShareSheet payload={payload} onClose={() => setOpen(false)} />}
    </>
  );
}
