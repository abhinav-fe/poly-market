"use client";
import { useAuth }        from "@/store/AuthContext";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import AuthGuard  from "@/components/auth/AuthGuard";
import TokenChip  from "@/components/ui/TokenChip";

const MEDALS = ["🥇","🥈","🥉"];

function accuracy(u) { return u.total === 0 ? 0 : Math.round((u.correct / u.total) * 100); }

export default function LeaderboardPage() {
  const { user }              = useAuth();
  const { leaderboard, loading } = useLeaderboard();

  return (
    <AuthGuard>
      <div className="px-4 pb-24 pt-2">
        <h2 className="text-lg font-bold mb-1">🏆 Top Predictors</h2>
        <p className="text-xs text-gray-500 mb-4">Ranked by token wealth · non-redeemable</p>
        {loading ? (
          <div className="flex flex-col gap-3">
            {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-2xl bg-gray-800 animate-pulse" />)}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {leaderboard.map(u => (
              <div key={u.id} className={`flex items-center gap-3 p-3 rounded-2xl border
                ${u.id === user?.uid ? "border-indigo-500 bg-indigo-950/40" : "border-gray-800 bg-gray-900"}`}>
                <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                  ${u.rank === 1 ? "bg-yellow-500 text-black" : u.rank === 2 ? "bg-gray-400 text-black" : u.rank === 3 ? "bg-amber-700 text-white" : "bg-gray-800 text-gray-400"}`}>
                  {u.rank <= 3 ? MEDALS[u.rank-1] : u.rank}
                </div>
                {u.photoURL
                  ? <img src={u.photoURL} className="w-8 h-8 rounded-full" alt="" />
                  : <div className="w-8 h-8 rounded-full bg-indigo-800 flex items-center justify-center text-sm font-bold">{(u.displayName||"U")[0]}</div>
                }
                <div className="flex-1">
                  <div className="font-semibold text-sm">
                    {u.displayName} {u.id === user?.uid && <span className="text-indigo-400 text-xs">(You)</span>}
                  </div>
                  <div className="text-xs text-gray-500">{u.correct}/{u.total} correct · {accuracy(u)}% accuracy</div>
                </div>
                <TokenChip amount={u.tokens} />
              </div>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
