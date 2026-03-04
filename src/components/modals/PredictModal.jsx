"use client";
import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { QUICK_STAKES } from "@/constants";
import Modal from "@/components/ui/Modal";

export default function PredictModal({ event }) {
  const { me, placePrediction, setModal } = useApp();
  const [selectedOpt, setSelectedOpt] = useState(null);
  const [stakeAmt,    setStakeAmt]    = useState(100);

  const handleSubmit = () => {
    if (!selectedOpt) return;
    if (placePrediction(event.id, selectedOpt, stakeAmt)) setModal(null);
  };

  return (
    <Modal>
      <h3 className="font-bold text-base mb-1">Place Your Prediction</h3>
      <p className="text-sm text-gray-400 mb-3 leading-snug">{event.title}</p>
      <p className="text-xs text-gray-500 mb-2">Balance: 🪙 {me.tokens.toLocaleString()}</p>
      <div className="flex gap-2 mb-4">
        {event.options.map(o => (
          <button key={o.id} onClick={() => setSelectedOpt(o.id)}
            className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${selectedOpt === o.id ? "border-indigo-400 bg-indigo-700 text-white" : "border-gray-700 bg-gray-800 text-gray-300"}`}>
            {o.label}
          </button>
        ))}
      </div>
      <div className="mb-4">
        <label className="text-xs text-gray-400 mb-1 block">Stake amount</label>
        <input type="number" min={10} max={me.tokens} value={stakeAmt} onChange={e => setStakeAmt(+e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-indigo-500" />
        <div className="flex gap-2 mt-2">
          {QUICK_STAKES.map(v => (
            <button key={v} onClick={() => setStakeAmt(v)}
              className={`text-xs px-2 py-1 rounded-lg border transition-all ${stakeAmt === v ? "border-indigo-500 bg-indigo-800 text-indigo-200" : "border-gray-700 bg-gray-800 text-gray-400"}`}>
              {v}
            </button>
          ))}
        </div>
      </div>
      <button disabled={!selectedOpt} onClick={handleSubmit}
        className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold text-sm">
        Stake 🪙 {stakeAmt} on {selectedOpt ? event.options.find(o => o.id === selectedOpt)?.label : "..."}
      </button>
    </Modal>
  );
}
