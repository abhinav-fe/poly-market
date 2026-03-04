#!/bin/bash
# Run from your Next.js project root
# bash setup-auth.sh

set -e
echo "🔐 Setting up Firebase Auth..."

SRC_DIR="src"
APP_DIR="src/app"

# ── Install Firebase ─────────────────────────
echo "📦 Installing firebase..."
npm install firebase

# ── Create .env.local ────────────────────────
if [ ! -f ".env.local" ]; then
cat > .env.local << 'EOF'
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
EOF
echo "⚠️  .env.local created — fill in your Firebase values before running the app!"
else
echo "⏭️  .env.local already exists, skipping."
fi

# ── Add .env.local to .gitignore ─────────────
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
  echo ".env.local" >> .gitignore
  echo "✅ Added .env.local to .gitignore"
fi

mkdir -p $SRC_DIR/lib
mkdir -p $APP_DIR/login
mkdir -p $APP_DIR/signup

# ════════════════════════════════════════════
# src/lib/firebase.js
# ════════════════════════════════════════════
cat > $SRC_DIR/lib/firebase.js << 'EOF'
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey:            process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain:        process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId:         process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket:     process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId:             process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Prevent re-initializing on hot reload
const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth         = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
EOF

# ════════════════════════════════════════════
# src/store/AuthContext.js
# ════════════════════════════════════════════
cat > $SRC_DIR/store/AuthContext.js << 'EOF'
"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true); // true until Firebase resolves

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser ?? null);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
EOF

# ════════════════════════════════════════════
# src/components/auth/AuthGuard.jsx
# Wraps protected pages — redirects to /login if not authed
# ════════════════════════════════════════════
cat > $SRC_DIR/components/auth/AuthGuard.jsx << 'EOF'
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/AuthContext";

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading) return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-4 animate-pulse">🔮</div>
        <p className="text-gray-400 text-sm">Loading...</p>
      </div>
    </div>
  );

  if (!user) return null; // Prevent flash before redirect

  return <>{children}</>;
}
EOF

# ════════════════════════════════════════════
# src/components/auth/GoogleButton.jsx
# ════════════════════════════════════════════
cat > $SRC_DIR/components/auth/GoogleButton.jsx << 'EOF'
"use client";

import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function GoogleButton({ label = "Continue with Google" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleGoogle = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      router.replace("/feed");
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleGoogle} disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 rounded-xl border border-gray-600 bg-gray-800 hover:bg-gray-700 text-sm font-semibold transition-all disabled:opacity-50">
      {/* Google SVG icon */}
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.6 20H24v8h11.3C33.6 33.1 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20c11 0 20-8 20-20 0-1.3-.1-2.7-.4-4z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.1 18.9 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.1 6.5 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.2 0 9.9-1.9 13.5-5l-6.2-5.2C29.4 35.6 26.8 36 24 36c-5.2 0-9.6-2.9-11.3-7l-6.5 5C9.6 39.6 16.3 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20H24v8h11.3c-.8 2.3-2.3 4.2-4.2 5.6l6.2 5.2C41 35.2 44 30 44 24c0-1.3-.1-2.7-.4-4z"/>
      </svg>
      {loading ? "Signing in..." : label}
    </button>
  );
}
EOF

# ════════════════════════════════════════════
# app/login/page.jsx
# ════════════════════════════════════════════
cat > $APP_DIR/login/page.jsx << 'EOF'
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import GoogleButton from "@/components/auth/GoogleButton";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.replace("/feed");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔮</div>
          <h1 className="text-2xl font-bold text-white">PredictIndia</h1>
          <p className="text-gray-400 text-sm mt-1">Predict events. Prove you called it.</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">Welcome back</h2>

          {error && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-bold text-sm transition-all mt-1">
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          <GoogleButton label="Sign in with Google" />

          <p className="text-center text-xs text-gray-500 mt-5">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-indigo-400 hover:underline font-medium">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-credential": return "Invalid email or password.";
    case "auth/too-many-requests":  return "Too many attempts. Try again later.";
    case "auth/invalid-email":      return "Please enter a valid email.";
    default:                        return "Something went wrong. Please try again.";
  }
}
EOF

# ════════════════════════════════════════════
# app/signup/page.jsx
# ════════════════════════════════════════════
cat > $APP_DIR/signup/page.jsx << 'EOF'
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import GoogleButton from "@/components/auth/GoogleButton";

export default function SignupPage() {
  const router = useRouter();
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [confirm,  setConfirm]  = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6)  { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      router.replace("/feed");
    } catch (err) {
      setError(friendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔮</div>
          <h1 className="text-2xl font-bold text-white">PredictIndia</h1>
          <p className="text-gray-400 text-sm mt-1">Join thousands of predictors.</p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-5">Create your account</h2>

          {error && (
            <div className="mb-4 px-4 py-2 rounded-xl bg-red-900/40 border border-red-700/50 text-red-300 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Display Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="Rahul Mumbai" required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="Min. 6 characters" required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <div>
              <label className="text-xs text-gray-400 mb-1 block">Confirm Password</label>
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                placeholder="••••••••" required
                className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 font-bold text-sm transition-all mt-1">
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-4">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-xs text-gray-500">or</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          <GoogleButton label="Sign up with Google" />

          <p className="text-center text-xs text-gray-500 mt-5">
            Already have an account?{" "}
            <Link href="/login" className="text-indigo-400 hover:underline font-medium">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function friendlyError(code) {
  switch (code) {
    case "auth/email-already-in-use": return "This email is already registered.";
    case "auth/invalid-email":        return "Please enter a valid email.";
    case "auth/weak-password":        return "Password is too weak.";
    default:                          return "Something went wrong. Please try again.";
  }
}
EOF

# ════════════════════════════════════════════
# Update app/layout.js — add AuthProvider
# ════════════════════════════════════════════
cat > $APP_DIR/layout.js << 'EOF'
import "./globals.css";
import { AppProvider }  from "@/store/AppContext";
import { AuthProvider } from "@/store/AuthContext";
import Header           from "@/components/layout/Header";
import Toast            from "@/components/ui/Toast";
import ModalManager     from "@/components/modals/ModalManager";

export const metadata = {
  title:       "PredictIndia 🔮",
  description: "Predict events. Prove you called it.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-950 text-white font-sans">
        <AuthProvider>
          <AppProvider>
            <Toast />
            <Header />
            <main className="pb-10">{children}</main>
            <ModalManager />
          </AppProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
EOF

# ════════════════════════════════════════════
# Update Header — show user avatar + logout
# ════════════════════════════════════════════
cat > $SRC_DIR/components/layout/Header.jsx << 'EOF'
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp }  from "@/store/AppContext";
import { useAuth } from "@/store/AuthContext";
import TokenChip   from "@/components/ui/TokenChip";

const TABS = [
  { href: "/feed",        label: "🏠 Feed"    },
  { href: "/leaderboard", label: "🏆 Leaders" },
  { href: "/profile",     label: "👤 Profile" },
];

export default function Header() {
  const { me, myRank }  = useApp();
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router   = useRouter();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null; // Hide header on auth pages

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
        <div className="flex items-center gap-3">
          <TokenChip amount={me.tokens} />
          <span className="text-sm bg-gray-800 rounded-full px-3 py-1 text-gray-300">#{myRank}</span>

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
                className="text-xs text-gray-400 hover:text-red-400 transition-colors">
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
EOF

# ════════════════════════════════════════════
# Wrap protected pages with AuthGuard
# ════════════════════════════════════════════

# feed
cat > $APP_DIR/feed/page.jsx << 'EOF'
"use client";
import { useState } from "react";
import { useApp } from "@/store/AppContext";
import AuthGuard        from "@/components/auth/AuthGuard";
import CategoryFilter   from "@/components/event/CategoryFilter";
import EventList        from "@/components/event/EventList";

export default function FeedPage() {
  const { events, setModal } = useApp();
  const [cat, setCat] = useState("All");
  const filtered = events.filter(e => cat === "All" || e.category === cat);

  return (
    <AuthGuard>
      <div className="px-4 pb-24 relative">
        <CategoryFilter active={cat} onChange={setCat} />
        <EventList events={filtered} />
        <button onClick={() => setModal({ type: "create" })}
          className="fixed bottom-6 right-5 z-40 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-full px-5 py-3 shadow-xl flex items-center gap-2">
          <span className="text-lg">+</span> Create Event
        </button>
      </div>
    </AuthGuard>
  );
}
EOF

# leaderboard
cat > $APP_DIR/leaderboard/page.jsx << 'EOF'
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
EOF

# profile
cat > $APP_DIR/profile/page.jsx << 'EOF'
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
EOF

echo ""
echo "✅ Auth setup complete!"
echo ""
echo "⚠️  IMPORTANT — Before running the app:"
echo ""
echo "1. Fill in your Firebase values in .env.local"
echo "2. In Firebase Console → Authentication → Sign-in methods:"
echo "   ✅ Enable Email/Password"
echo "   ✅ Enable Google"
echo "3. In Firebase Console → Authentication → Settings → Authorized domains:"
echo "   ✅ Add 'localhost'"
echo ""
echo "👉 Then restart the app:"
echo "   rm -rf .next && npm run dev"