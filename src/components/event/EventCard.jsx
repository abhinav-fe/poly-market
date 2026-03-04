"use client";
import { useApp } from "@/store/AppContext";
import { totalVotes } from "@/utils/helpers";
import Badge from "@/components/ui/Badge";
import OptionRow from "@/components/event/OptionRow";

export default function EventCard({ event }) {
  const { myPredictions, setModal } = useApp();
  const mine     = myPredictions[event.id];
  const tv       = totalVotes(event);
  const isWinner = mine && event.resolved && event.winner === mine;
  const isLoser  = mine && event.resolved && event.winner !== mine;

  return (
    <div className={`rounded-2xl border p-4 bg-gray-900 ${event.resolved ? "border-gray-700 opacity-90" : "border-gray-700"} ${isWinner ? "border-emerald-500/60" : ""} ${isLoser ? "border-red-800/40" : ""}`}>
      <div className="flex items-start gap-2 mb-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge category={event.category} />
            {event.resolved && <span className="text-xs px-2 py-0.5 rounded-full bg-gray-700 text-gray-400">Resolved</span>}
            {isWinner && <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-700 text-emerald-200 font-bold">✅ You called it!</span>}
            {isLoser  && <span className="text-xs px-2 py-0.5 rounded-full bg-red-900 text-red-300">❌ Wrong call</span>}
          </div>
          <p className="font-semibold text-sm leading-snug">{event.title}</p>
        </div>
      </div>
      <div className="flex gap-1 flex-wrap mb-3">
        {event.tags.map(t => <span key={t} className="text-xs text-gray-500">#{t}</span>)}
      </div>
      <div className="flex flex-col gap-2 mb-3">
        {event.options.map(o => (
          <OptionRow key={o.id} option={o} totalVotesCount={tv} isMyPick={mine === o.id} isWinOpt={event.resolved && event.winner === o.id} />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-500">👥 {tv} · 🪙 {event.totalPool.toLocaleString()} pool · by {event.createdBy}</span>
        <div className="flex gap-2">
          <button onClick={() => setModal({ type: "share", event })} className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700">Share</button>
          {!mine && !event.resolved && (
            <button onClick={() => setModal({ type: "predict", event })} className="text-xs px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold">Predict</button>
          )}
        </div>
      </div>
    </div>
  );
}
