"use client";
import { useApp } from "@/store/AppContext";
import { pct, totalVotes } from "@/utils/helpers";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";

export default function ShareModal({ event }) {
  const { myPredictions, myStakes, setModal, showToast } = useApp();
  const mine  = myPredictions[event.id];
  const myOpt = mine ? event.options.find(o => o.id === mine) : null;
  const tv    = totalVotes(event);
  const shareText = mine
    ? `🔮 I predicted "${myOpt?.label}" on:\n"${event.title}"\n\n📅 Called it on PredictIndia!\n#PredictIndia #${event.category}`
    : `🔮 Hot prediction:\n"${event.title}"\n\n${event.options.map(o => `${o.label}: ${pct(o.votes, tv)}%`).join("  |  ")}\n\n#PredictIndia #${event.category}`;

  return (
    <Modal>
      <h3 className="font-bold text-base mb-3">Share Prediction</h3>
      <div className="bg-gray-800 rounded-2xl p-4 mb-4 border border-gray-700">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-2xl">🔮</span>
          <span className="font-bold text-indigo-400">PredictIndia</span>
          <Badge category={event.category} />
        </div>
        <p className="text-sm font-medium mb-3">{event.title}</p>
        {mine && (
          <div className="bg-indigo-900/40 border border-indigo-700/50 rounded-xl p-2 text-xs text-indigo-300 mb-3">
            ✅ I predicted: <strong>{myOpt?.label}</strong> · 🪙 {myStakes[event.id]} staked
          </div>
        )}
        <div className="text-xs text-gray-500">{tv} predictions · 🪙 {event.totalPool.toLocaleString()} pool</div>
      </div>
      <div className="bg-gray-800 rounded-xl p-3 mb-4 text-xs text-gray-300 font-mono whitespace-pre-line">{shareText}</div>
      <button onClick={() => { navigator.clipboard?.writeText(shareText); showToast("Copied!"); setModal(null); }}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-sm">
        📋 Copy & Share
      </button>
    </Modal>
  );
}
