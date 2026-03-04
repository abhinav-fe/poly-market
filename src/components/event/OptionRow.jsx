import { pct } from "@/utils/helpers";
import ProgressBar from "@/components/ui/ProgressBar";
export default function OptionRow({ option, totalVotesCount, isMyPick, isWinOpt }) {
  const p = pct(option.votes, totalVotesCount);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className={`font-medium ${isMyPick ? "text-indigo-300" : "text-gray-300"}`}>
          {option.label} {isMyPick && <span className="text-indigo-400">← your pick</span>}
        </span>
        <span className="text-gray-400">{p}% · 🪙 {option.pool.toLocaleString()}</span>
      </div>
      <ProgressBar pct={p} isWin={isWinOpt} isMyPick={isMyPick} />
    </div>
  );
}
