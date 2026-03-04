export default function TokenChip({ amount }) {
  return (
    <span className="inline-flex items-center gap-1 bg-yellow-900/40 border border-yellow-700/50 rounded-full px-3 py-1 font-bold text-yellow-400 text-sm">
      🪙 {typeof amount === "number" ? amount.toLocaleString() : amount}
    </span>
  );
}
