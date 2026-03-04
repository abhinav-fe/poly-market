import { BADGE_COLORS } from "@/constants";
export default function Badge({ category }) {
  return <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${BADGE_COLORS[category] || "bg-gray-700 text-gray-300"}`}>{category}</span>;
}
