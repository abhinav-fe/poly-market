"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp }  from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import TokenChip   from "@/components/ui/TokenChip";
import ShareButton from "@/components/share/ShareButton";
import { buildAppShare } from "@/components/share/useShare";

const TABS = [
  { href: "/feed",        label: "🏠 Feed"    },
  { href: "/leaderboard", label: "🏆 Leaders" },
  { href: "/profile",     label: "👤 Profile" },
];

export default function Header() {
  const { me, myRank }   = useApp();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  const handleLogout = async () => {
    await logout();
    router.replace("/login");
  };

  return (
    <div className="sticky top-0 z-40 bg-gray-950/95 backdrop-blur border-b border-gray-800">
      <div className="px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔮</span>
          <span className="font-bold text-lg tracking-tight">PredictIndia</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <TokenChip amount={me.tokens} />
          <span className="text-sm bg-gray-800 rounded-full px-3 py-1 text-gray-300">#{myRank}</span>

          {/* App share button */}
          <ShareButton
            payload={buildAppShare()}
            label=""
            icon="📤"
            className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-sm"
          />

          {/* User avatar + logout */}
          {user && (
            <div className="flex items-center gap-2">
              {user.photoURL
                ? <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full border border-gray-600" />
                : <div className="w-8 h-8 rounded-full bg-indigo-700 flex items-center justify-center text-sm font-bold">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
              }
              <button onClick={handleLogout}
                className="text-xs text-gray-400 hover:text-red-400 transition-colors hidden sm:block">
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Nav tabs */}
      <nav className="flex gap-1 px-4 pb-3">
        {TABS.map(({ href, label }) => (
          <Link key={href} href={href}
            className={`flex-1 py-2 rounded-xl text-sm font-semibold text-center transition-all
              ${pathname === href ? "bg-indigo-600 text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}>
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
