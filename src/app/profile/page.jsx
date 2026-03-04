"use client";
import { useApp }  from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import { accuracy } from "@/utils/helpers";
import AuthGuard from "@/components/auth/AuthGuard";

function StatBox({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-xl p-3 text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function PredictionHistoryItem({ event }) {
  const { myPredictions, myStakes, setModal } = useApp();
  const optId = myPredictions[event.id];
  const opt   = event.options.find(o => o.id === optId);
  const won   = event.resolved && event.winner === optId;
  const lost  = event.resolved && event.winner !== optId;
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-3">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium leading-snug">{event.title}</p>
          <p className="text-xs text-indigo-400 mt-0.5">Your pick: {opt?.label}</p>
        </div>
        <div className="ml-2 shrink-0">
          {won  && <span className="text-xs bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full font-bold">Won 🎉</span>}
          {lost && <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">Lost</span>}
          {!event.resolved && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Pending</span>}
        </div>
      </div>
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-gray-500">🪙 {myStakes[event.id]} staked · Ends {event.endsAt}</span>
        <button onClick={() => setModal({ type: "share", event })} className="text-xs text-indigo-400 hover:underline">Share proof</button>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { me, myPredictions, events } = useApp();
  const { user } = useAuth();
  const myEvents = events.filter(e => myPredictions[e.id]);

  return (
    <AuthGuard>
      <div className="px-4 pb-24 pt-2">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4 text-center">
          {user?.photoURL
            ? <img src={user.photoURL} alt="avatar" className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-indigo-500" />
            : <div className="w-16 h-16 rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {(user?.displayName || user?.email || "U")[0].toUpperCase()}
              </div>
          }
          <div className="font-bold text-xl">{user?.displayName || "Predictor"}</div>
          <div className="text-gray-400 text-sm mb-4">{user?.email}</div>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="🪙 Tokens"   value={me.tokens.toLocaleString()} />
            <StatBox label="✅ Correct"  value={me.correct} />
            <StatBox label="🎯 Accuracy" value={`${accuracy(me)}%`} />
          </div>
        </div>
        <h3 className="font-bold mb-3 text-sm text-gray-400 uppercase tracking-wide">My Predictions</h3>
        <div className="flex flex-col gap-3">
          {myEvents.map(e => <PredictionHistoryItem key={e.id} event={e} />)}
        </div>
      </div>
    </AuthGuard>
  );
}
