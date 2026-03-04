"use client";
import { useApp } from "@/store/AppContext";
export default function Modal({ children }) {
  const { setModal } = useApp();
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center" onClick={() => setModal(null)}>
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-t-3xl p-5 pb-8" onClick={e => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
