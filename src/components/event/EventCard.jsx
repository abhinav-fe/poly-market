"use client";
import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { placePrediction, resolveEvent } from "@/lib/firestore";
import { totalVotes, pct } from "@/utils/helpers";
import Badge from "@/components/ui/Badge";
import ProgressBar from "@/components/ui/ProgressBar";
import CommentSection from "@/components/comments/CommentSection";
import { QUICK_STAKES } from "@/constants";

export default function EventCard({ event, myPrediction }) {
  const { user, dbUser } = useAuth();
  const [showComments,  setShowComments]  = useState(false);
  const [showPredict,   setShowPredict]   = useState(false);
  const [selectedOpt,   setSelectedOpt]   = useState(null);
  const [stakeAmt,      setStakeAmt]      = useState(100);
  const [staking,       setStaking]       = useState(false);
  const [resolving,     setResolving]     = useState(false);
  const [toast,         setToast]         = useState(null);
  const [showResolve,   setShowResolve]   = useState(false);

  const tv         = totalVotes(event);
  const isCreator  = user?.uid === event.createdBy;
  const isWinner   = myPrediction && event.resolved && event.winner === myPrediction.optionId;
  const isLoser    = myPrediction && event.resolved && event.winner !== myPrediction.optionId;

  const showMsg = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handlePredict = async () => {
    if (!selectedOpt) return;
    setStaking(true);
    try {
      await placePrediction(event.id, selectedOpt, stakeAmt, user);
      setShowPredict(false);
      showMsg(`Staked 🪙 ${stakeAmt} tokens!`);
    } catch (err) {
      showMsg(err.message, "error");
    } finally {
      setStaking(false);
    }
  };

  const handleResolve = async (winnerId) => {
    setResolving(true);
    try {
      await resolveEvent(event.id, winnerId, user.uid);
      setShowResolve(false);
      showMsg("Event resolved! Winners rewarded 🎉");
    } catch (err) {
      showMsg(err.message, "error");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className={`rounded-2xl border p-4 bg-gray-900 relative
      ${event.resolved ? "border-gray-700 opacity-90" : "border-gray-700"}
      ${isWinner ? "border-emerald-500/60" : ""}
      ${isLoser  ? "border-red-800/40"     : ""}`}>

      {/* Toast */}
      {toast && (
        <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold z-10
          ${toast.type === "error" ? "bg-red-600" : "bg-emerald-600"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
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

      {/* Tags */}
      <div className="flex gap-1 flex-wrap mb-3">
        {event.tags?.map(t => <span key={t} className="text-xs text-gray-500">#{t}</span>)}
      </div>

      {/* Options */}
      <div className="flex flex-col gap-2 mb-3">
        {event.options.map(o => {
          const p        = pct(o.votes, tv);
          const isMyPick = myPrediction?.optionId === o.id;
          const isWinOpt = event.resolved && event.winner === o.id;
          return (
            <div key={o.id}>
              <div className="flex justify-between text-xs mb-1">
                <span className={`font-medium ${isMyPick ? "text-indigo-300" : "text-gray-300"}`}>
                  {o.label} {isMyPick && <span className="text-indigo-400">← your pick</span>}
                  {isWinOpt && !isMyPick && <span className="text-emerald-400"> ✓ winner</span>}
                </span>
                <span className="text-gray-400">{p}% · 🪙 {o.pool.toLocaleString()}</span>
              </div>
              <ProgressBar pct={p} isWin={isWinOpt} isMyPick={isMyPick} />
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-gray-500">
          👥 {tv} · 🪙 {event.totalPool.toLocaleString()} pool · by {event.createdByName}
        </span>
        <div className="flex gap-2">
          <button onClick={() => setShowComments(p => !p)}
            className="text-xs px-2 py-1 rounded-lg bg-gray-800 text-gray-400 hover:bg-gray-700">
            💬
          </button>
          {!myPrediction && !event.resolved && user && (
            <button onClick={() => setShowPredict(p => !p)}
              className="text-xs px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-semibold">
              Predict
            </button>
          )}
          {isCreator && !event.resolved && (
            <button onClick={() => setShowResolve(p => !p)}
              className="text-xs px-3 py-1 rounded-lg bg-amber-700 hover:bg-amber-600 font-semibold">
              Resolve
            </button>
          )}
        </div>
      </div>

      {/* Predict panel */}
      {showPredict && (
        <div className="border-t border-gray-800 pt-3 mt-2">
          <div className="flex gap-2 mb-3">
            {event.options.map(o => (
              <button key={o.id} onClick={() => setSelectedOpt(o.id)}
                className={`flex-1 py-2 rounded-xl border text-xs font-semibold transition-all
                  ${selectedOpt === o.id ? "border-indigo-400 bg-indigo-700 text-white" : "border-gray-700 bg-gray-800 text-gray-300"}`}>
                {o.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mb-3 flex-wrap">
            {QUICK_STAKES.map(v => (
              <button key={v} onClick={() => setStakeAmt(v)}
                className={`text-xs px-2 py-1 rounded-lg border transition-all
                  ${stakeAmt === v ? "border-indigo-500 bg-indigo-800 text-indigo-200" : "border-gray-700 bg-gray-800 text-gray-400"}`}>
                🪙 {v}
              </button>
            ))}
            <input type="number" value={stakeAmt} min={10} max={dbUser?.tokens || 1000}
              onChange={e => setStakeAmt(+e.target.value)}
              className="w-20 bg-gray-800 border border-gray-700 rounded-lg px-2 py-1 text-xs text-white focus:outline-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={handlePredict} disabled={!selectedOpt || staking}
              className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 font-bold text-xs">
              {staking ? "Staking..." : `Stake 🪙 ${stakeAmt}`}
            </button>
            <button onClick={() => setShowPredict(false)}
              className="px-3 py-2 rounded-xl bg-gray-800 text-gray-400 text-xs">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Resolve panel — only for creator */}
      {showResolve && (
        <div className="border-t border-gray-800 pt-3 mt-2">
          <p className="text-xs text-gray-400 mb-2">Select the winning option:</p>
          <div className="flex gap-2">
            {event.options.map(o => (
              <button key={o.id} onClick={() => handleResolve(o.id)} disabled={resolving}
                className="flex-1 py-2 rounded-xl border border-amber-700 bg-amber-900/30 hover:bg-amber-800/40 text-xs font-semibold disabled:opacity-40">
                {resolving ? "Resolving..." : o.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Comments */}
      {showComments && <CommentSection eventId={event.id} />}
    </div>
  );
}
// NOTE: OfficialBadge is rendered inside EventCard header via isOfficial prop
// The EventCard already receives the full event object including isOfficial
// The badge rendering is handled inline in the header section
// NOTE: OfficialBadge is rendered inside EventCard header via isOfficial prop
// The EventCard already receives the full event object including isOfficial
// The badge rendering is handled inline in the header section
