"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useShare } from "./useShare";

const PLATFORMS = [
  { id: "native", label: "Share", icon: "📤", bg: "bg-gray-700" },
  { id: "whatsapp", label: "WhatsApp", icon: "💬", bg: "bg-green-700" },
  { id: "twitter", label: "Twitter / X", icon: "🐦", bg: "bg-sky-700" },
  { id: "instagram", label: "Instagram", icon: "📸", bg: "bg-pink-700" },
  { id: "copy", label: "Copy link", icon: "🔗", bg: "bg-gray-700" },
];

export default function ShareSheet({ payload, onClose }) {
  const { copied, handleCopy, shareToWhatsApp, shareToTwitter, nativeShare } =
    useShare();
  const ref = useRef(null);

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handle = async (id) => {
    switch (id) {
      case "native":
        await nativeShare(payload);
        break;
      case "whatsapp":
        shareToWhatsApp(payload);
        break;
      case "twitter":
        shareToTwitter(payload);
        break;
      case "instagram":
        await handleCopy(payload);
        alert("Text copied! Paste in your Instagram story 📸");
        break;
      case "copy":
        await handleCopy(payload);
        break;
    }
  };

  const sheet = (
    <div
      className="fixed bottom-0 left-0 right-0 top-0 z-[9999] flex flex-col justify-end md:justify-center md:items-center bg-black/70"
      onClick={onClose}
    >
      <div
        ref={ref}
        className="w-full md:w-1/2 bg-gray-900 border border-gray-700 rounded-t-3xl md:rounded-3xl p-5 pb-10 mx-auto"
        style={{ maxHeight: "75vh", overflowY: "auto" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-5" />

        <h3 className="font-bold text-base text-white mb-1">Share</h3>
        <p className="text-xs text-gray-500 mb-5 line-clamp-2">
          {payload?.text}
        </p>

        {/* Platforms */}
        <div className="flex gap-3 justify-around mb-6">
          {PLATFORMS.filter(
            (p) =>
              p.id !== "native" ||
              (typeof navigator !== "undefined" && !!navigator.share),
          ).map((p) => (
            <button
              key={p.id}
              onClick={() => handle(p.id)}
              className="flex flex-col items-center gap-1.5"
            >
              <div
                className={`w-13 h-13 w-12 h-12 rounded-2xl ${p.bg} flex items-center justify-center text-2xl`}
              >
                {p.id === "copy" && copied ? "✅" : p.icon}
              </div>
              <span className="text-xs text-gray-400 text-center">
                {p.id === "copy" && copied ? "Copied!" : p.label}
              </span>
            </button>
          ))}
        </div>

        {/* Preview */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔮</span>
            <span className="font-bold text-indigo-400 text-sm">
              PredictIndia
            </span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed line-clamp-3">
            {payload?.text}
          </p>
          <p className="text-xs text-indigo-400 mt-2 truncate">
            {payload?.url}
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-gray-800 text-gray-400 text-sm font-semibold"
        >
          Cancel
        </button>
      </div>
    </div>
  );

  // Render into document.body via portal
  return createPortal(sheet, document.body);
}
