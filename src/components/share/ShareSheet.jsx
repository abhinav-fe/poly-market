"use client";
import { useShare } from "./useShare";

const PLATFORMS = [
  {
    id:    "native",
    label: "Share",
    icon:  "📤",
    bg:    "bg-gray-700",
    show:  () => typeof navigator !== "undefined" && !!navigator.share,
  },
  {
    id:    "whatsapp",
    label: "WhatsApp",
    icon:  "💬",
    bg:    "bg-green-700",
    show:  () => true,
  },
  {
    id:    "twitter",
    label: "Twitter / X",
    icon:  "🐦",
    bg:    "bg-sky-700",
    show:  () => true,
  },
  {
    id:    "instagram",
    label: "Instagram",
    icon:  "📸",
    bg:    "bg-pink-700",
    show:  () => true,
  },
  {
    id:    "copy",
    label: "Copy link",
    icon:  "🔗",
    bg:    "bg-gray-700",
    show:  () => true,
  },
];

export default function ShareSheet({ payload, onClose }) {
  const { copied, handleCopy, shareToWhatsApp, shareToTwitter, nativeShare } = useShare();

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
        alert("Text copied! Open Instagram and paste in your story or bio 📸");
        break;
      case "copy":
        await handleCopy(payload);
        break;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center"
      onClick={onClose}>
      <div className="w-full max-w-lg bg-gray-900 border border-gray-700 rounded-t-3xl p-5 pb-8"
        onClick={e => e.stopPropagation()}>

        {/* Handle */}
        <div className="w-10 h-1 bg-gray-700 rounded-full mx-auto mb-4" />

        <h3 className="font-bold text-base mb-1">Share</h3>
        <p className="text-xs text-gray-500 mb-5 leading-snug line-clamp-2">{payload.text}</p>

        {/* Platform grid */}
        <div className="grid grid-cols-5 gap-3 mb-5">
          {PLATFORMS.filter(p => p.show()).map(p => (
            <button key={p.id} onClick={() => handle(p.id)}
              className="flex flex-col items-center gap-1.5 group">
              <div className={`w-12 h-12 rounded-2xl ${p.bg} flex items-center justify-center text-2xl group-hover:opacity-80 transition-all`}>
                {p.id === "copy" && copied ? "✅" : p.icon}
              </div>
              <span className="text-xs text-gray-400 text-center leading-tight">
                {p.id === "copy" && copied ? "Copied!" : p.label}
              </span>
            </button>
          ))}
        </div>

        {/* Preview box */}
        <div className="bg-gray-800 rounded-2xl p-4 border border-gray-700 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔮</span>
            <span className="font-bold text-indigo-400 text-sm">PredictIndia</span>
          </div>
          <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-line line-clamp-4">
            {payload.text}
          </p>
          <p className="text-xs text-indigo-400 mt-2 truncate">{payload.url}</p>
        </div>

        <button onClick={onClose}
          className="w-full py-3 rounded-xl bg-gray-800 text-gray-400 text-sm font-semibold hover:bg-gray-700">
          Cancel
        </button>
      </div>
    </div>
  );
}
