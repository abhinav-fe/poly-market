"use client";
import { useAuth }            from "@/store/AuthContext";
import { useUserPredictions } from "@/hooks/useUserPredictions";
import { useApp }             from "@/store/AppContext";
import AuthGuard from "@/components/auth/AuthGuard";

function StatBox({ label, value }) {
  return (
    <div className="bg-gray-800 rounded-xl p-3 text-center">
      <div className="text-lg font-bold">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}

function accuracy(u) { return !u || u.total === 0 ? 0 : Math.round((u.correct / u.total) * 100); }

export default function ProfilePage() {
  const { user, dbUser }         = useAuth();
  const { setModal }             = useApp();
  const { predictions, loading } = useUserPredictions(user?.uid);

  return (
    <AuthGuard>
      <div className="px-4 pb-24 pt-2">
        {/* User card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4 text-center">
          {user?.photoURL
            ? <img src={user.photoURL} className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-indigo-500" alt="" />
            : <div className="w-16 h-16 rounded-full bg-indigo-700 flex items-center justify-center text-2xl font-bold mx-auto mb-3">
                {(user?.displayName || user?.email || "U")[0].toUpperCase()}
              </div>
          }
          <div className="font-bold text-xl">{user?.displayName || "Predictor"}</div>
          <div className="text-gray-400 text-sm mb-4">{user?.email}</div>
          <div className="grid grid-cols-3 gap-3">
            <StatBox label="🪙 Tokens"   value={(dbUser?.tokens ?? 0).toLocaleString()} />
            <StatBox label="✅ Correct"  value={dbUser?.correct ?? 0} />
            <StatBox label="🎯 Accuracy" value={`${accuracy(dbUser)}%`} />
          </div>
        </div>

        {/* Prediction history */}
        <h3 className="font-bold mb-3 text-sm text-gray-400 uppercase tracking-wide">My Predictions</h3>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2].map(i => <div key={i} className="h-20 rounded-xl bg-gray-800 animate-pulse" />)}
          </div>
        ) : predictions.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">No predictions yet. Go predict something!</p>
        ) : (
          <div className="flex flex-col gap-3">
            {predictions.map(p => {
              const opt  = p.event.options.find(o => o.id === p.optionId);
              const won  = p.event.resolved && p.event.winner === p.optionId;
              const lost = p.event.resolved && p.event.winner !== p.optionId;
              return (
                <div key={p.eventId} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium leading-snug">{p.event.title}</p>
                      <p className="text-xs text-indigo-400 mt-0.5">Your pick: {opt?.label}</p>
                    </div>
                    <div className="ml-2 shrink-0">
                      {won  && <span className="text-xs bg-emerald-700 text-emerald-200 px-2 py-0.5 rounded-full font-bold">Won 🎉</span>}
                      {lost && <span className="text-xs bg-red-900 text-red-300 px-2 py-0.5 rounded-full">Lost</span>}
                      {!p.event.resolved && <span className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full">Pending</span>}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-gray-500">🪙 {p.stake} staked · Ends {p.event.endsAt}</span>
                    <button onClick={() => setModal({ type: "share", event: p.event })}
                      className="text-xs text-indigo-400 hover:underline">Share proof</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
