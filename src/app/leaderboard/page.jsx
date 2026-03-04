"use client";
import { useApp } from "@/store/AppContext";
import { accuracy } from "@/utils/helpers";
import AuthGuard from "@/components/auth/AuthGuard";
import TokenChip from "@/components/ui/TokenChip";

const MEDALS = ["🥇","🥈","🥉"];

function LeaderboardRow({ user }) {
  const rankBg = user.rank === 1 ? "bg-yellow-500 text-black" : user.rank === 2 ? "bg-gray-400 text-black" : user.rank === 3 ? "bg-amber-700 text-white" : "bg-gray-800 text-gray-400";
  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl border ${user.id === "you" ? "border-indigo-500 bg-indigo-950/40" : "border-gray-800 bg-gray-900"}`}>
      <div className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${rankBg}`}>
        {user.rank <= 3 ? MEDALS[user.rank-1] : user.rank}
      </div>
      <div className="text-xl">{user.avatar}</div>
      <div className="flex-1">
        <div className="font-semibold text-sm">{user.name} {user.id === "you" && <span className="text-indigo-400 text-xs">(You)</span>}</div>
        <div className="text-xs text-gray-500">{user.correct}/{user.total} correct · {accuracy(user)}% accuracy</div>
      </div>
      <TokenChip amount={user.tokens} />
    </div>
  );
}

export default function LeaderboardPage() {
  const { leaderboard } = useApp();
  return (
    <AuthGuard>
      <div className="px-4 pb-24 pt-2">
        <h2 className="text-lg font-bold mb-1">🏆 Top Predictors</h2>
        <p className="text-xs text-gray-500 mb-4">Ranked by token wealth · non-redeemable</p>
        <div className="flex flex-col gap-3">
          {leaderboard.map(u => <LeaderboardRow key={u.id} user={u} />)}
        </div>
      </div>
    </AuthGuard>
  );
}
