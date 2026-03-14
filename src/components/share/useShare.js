"use client";
import { useState } from "react";

const APP_URL  = process.env.NEXT_PUBLIC_APP_URL || "https://poly-market-one.vercel.app";
const APP_NAME = "PredictIndia";

// ── Build share payloads ──────────────────
export function buildAppShare() {
  return {
    title:   `${APP_NAME} 🔮`,
    text:    `Predict India's hottest events — cricket, politics, Bollywood & more! Join me on ${APP_NAME} and show off your prediction skills 🧠`,
    url:     APP_URL,
    hashtags: "PredictIndia,Predictions",
  };
}

export function buildEventShare(event) {
  const url     = `${APP_URL}/event/${event.id}`;
  const total   = event.options.reduce((s, o) => s + o.votes, 0);
  const odds    = event.options.map(o => {
    const p = total === 0 ? 50 : Math.round((o.votes / total) * 100);
    return `${o.label} ${p}%`;
  }).join(" vs ");

  return {
    title:    event.title,
    text:     `🔮 ${event.title}\n\n📊 Current odds: ${odds}\n\n🪙 Pool: ${event.totalPool.toLocaleString()} tokens\n\nWhat do you think?`,
    url,
    hashtags: `PredictIndia,${event.category.replace(/\s/g, "")}`,
  };
}

export function buildPredictionShare(event, prediction) {
  const url  = `${APP_URL}/event/${event.id}`;
  const opt  = event.options.find(o => o.id === prediction.optionId);
  const won  = event.resolved && event.winner === prediction.optionId;
  const verb = won ? "called it ✅" : event.resolved ? "predicted ❌" : "predicted 🔮";

  return {
    title:    `I ${verb}: ${event.title}`,
    text:     `🔮 I ${verb}!\n\n"${event.title}"\n\nMy pick: ${opt?.label}\n🪙 Staked: ${prediction.stake} tokens\n\nProve YOUR predictions on ${APP_NAME}!`,
    url,
    hashtags: `PredictIndia,ICalledIt`,
  };
}

export function buildLeaderboardShare(user, rank) {
  return {
    title:    `I'm #${rank} on ${APP_NAME}!`,
    text:     `🏆 I'm ranked #${rank} on ${APP_NAME}!\n\n🪙 ${user.tokens?.toLocaleString()} tokens\n🎯 ${user.correct}/${user.total} predictions correct\n\nThink you can beat me? 👇`,
    url:      `${APP_URL}/leaderboard`,
    hashtags: `PredictIndia,Leaderboard`,
  };
}

// ── Platform share handlers ───────────────
export function shareToWhatsApp({ text, url }) {
  const msg = encodeURIComponent(`${text}\n\n${url}`);
  window.open(`https://wa.me/?text=${msg}`, "_blank");
}

export function shareToTwitter({ text, url, hashtags }) {
  const t = encodeURIComponent(text);
  const u = encodeURIComponent(url);
  const h = encodeURIComponent(hashtags || "");
  window.open(`https://twitter.com/intent/tweet?text=${t}&url=${u}&hashtags=${h}`, "_blank");
}

export function copyToClipboard({ text, url }) {
  const full = `${text}\n\n${url}`;
  return navigator.clipboard.writeText(full);
}

export async function nativeShare({ title, text, url }) {
  if (!navigator.share) return false;
  try {
    await navigator.share({ title, text, url });
    return true;
  } catch {
    return false;
  }
}

// ── Hook ─────────────────────────────────
export function useShare() {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (payload) => {
    await copyToClipboard(payload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return { copied, shareToWhatsApp, shareToTwitter, handleCopy, nativeShare };
}
