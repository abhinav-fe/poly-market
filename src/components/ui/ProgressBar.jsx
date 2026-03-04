export default function ProgressBar({ pct, isWin, isMyPick }) {
  const color = isWin ? "bg-emerald-500" : isMyPick ? "bg-indigo-500" : "bg-gray-600";
  return (
    <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
