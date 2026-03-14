"use client";
import { useState } from "react";
import { useAuth } from "@/store/AuthContext";
import { createEvent } from "@/lib/firestore";
import { CATEGORIES } from "@/constants";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/store/AppContext";

export default function CreateEventModal() {
  const { user }    = useAuth();
  const { setModal } = useApp();
  const [form, setForm] = useState({ title: "", category: "Cricket", endsAt: "", opt1: "", opt2: "", tags: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.endsAt || !form.opt1 || !form.opt2) { setError("Fill all fields"); return; }
    setLoading(true);
    try {
      await createEvent(form, user);
      setModal(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal>
      <h3 className="font-bold text-base mb-4">Create a Prediction Event</h3>
      {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
      <div className="flex flex-col gap-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Event question</label>
          <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="Will India win the next Test series?"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Category</label>
            <select value={form.category} onChange={e => set("category", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none bg-gray-800">
              {CATEGORIES.filter(c => c !== "All").map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-400 mb-1 block">Ends on</label>
            <input type="date" value={form.endsAt} onChange={e => set("endsAt", e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none" />
          </div>
        </div>
        <div className="flex gap-2">
          {["opt1","opt2"].map((k,i) => (
            <div key={k} className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Option {i+1}</label>
              <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={i === 0 ? "Yes 🏆" : "No ❌"}
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
            </div>
          ))}
        </div>
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Tags (comma separated)</label>
          <input value={form.tags} onChange={e => set("tags", e.target.value)} placeholder="BCCI, Test Cricket, India"
            className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-indigo-500" />
        </div>
        <button onClick={handleSubmit} disabled={loading}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-bold text-sm mt-1">
          {loading ? "Publishing..." : "🔮 Publish Event"}
        </button>
      </div>
    </Modal>
  );
}
