import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp }      from "firebase-admin/firestore";

// ── Init Firebase Admin ───────────────────
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

// ── Config ────────────────────────────────
const ADMIN_UID        = process.env.ADMIN_UID;          // your Firebase UID
const GEMINI_KEY       = process.env.GEMINI_API_KEY;
const EVENTS_PER_RUN   = 20;
const TODAY            = new Date().toISOString().split("T")[0];

const CATEGORIES = [
  "India Politics & Elections",
  "Cricket & Sports",
  "Bollywood & Entertainment",
  "Global Events",
  "Business & Economy",
  "Tech & Startups",
];

// ── Step 1: Ask Claude to generate events ─
async function generateEvents() {
  console.log("🧠 Asking Claude to generate events...");

  const prompt = `
You are a prediction market curator. Today's date is ${TODAY}.

Your job is to generate ${EVENTS_PER_RUN} exciting, timely prediction events for an India-focused prediction platform covering current hot topics.

Categories to cover (distribute evenly):
${CATEGORIES.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Rules:
- Each event must be based on something ACTUALLY happening right now or very soon
- Each event must have EXACTLY 2 options (binary prediction)
- Events must resolve within 7–90 days from today (${TODAY})
- Be specific — mention real names, teams, companies, dates
- Mix India-specific and global events
- Make them genuinely uncertain (not obvious outcomes)

Respond ONLY with a valid JSON array. No explanation, no markdown, no backticks.
Format:
[
  {
    "title": "Will India beat Australia in the 3rd Test at Melbourne?",
    "category": "Cricket & Sports",
    "tags": ["India", "Australia", "Test Cricket"],
    "endsAt": "2025-01-05",
    "options": [
      { "id": "yes", "label": "Yes 🏏" },
      { "id": "no",  "label": "No ❌" }
    ]
  }
]
`;

  // Gemini 2.0 Flash — free tier, supports Google Search grounding
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

  // const res = await fetch(url, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({
  //     contents: [{ parts: [{ text: prompt }] }],
  //     generationConfig: {
  //       temperature:     1,
  //       maxOutputTokens: 4000,
  //       responseMimeType: "application/json",  // force JSON output
  //     },
  //   }),
  // });


  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: "Say hello in one word" }] }],
      generationConfig: { maxOutputTokens: 10 },
    }),
  });
  
  const data1 = await res.json();
  console.log("STATUS:", res.status);
  console.log("RESPONSE:", JSON.stringify(data1, null, 2));
  process.exit(0);

  

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Gemini API error: ${err}`);
  }

  const data  = await res.json();
  const raw   = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!raw) throw new Error("No content in Gemini response");

  // Strip any accidental markdown fences just in case
  const clean  = raw.replace(/```json|```/g, "").trim();
  const events = JSON.parse(clean);
  console.log(`✅ Claude generated ${events.length} events`);
  return events;
}

// ── Step 2: Check for duplicates ──────────
async function filterDuplicates(events) {
  // Get events created in last 3 days to avoid near-duplicate titles
  const snap = await db.collection("events")
    .where("isOfficial", "==", true)
    .where("createdAt", ">=", Timestamp.fromDate(new Date(Date.now() - 3 * 86400000)))
    .get();

  const recentTitles = new Set(snap.docs.map(d => d.data().title.toLowerCase()));
  const filtered = events.filter(e => !recentTitles.has(e.title.toLowerCase()));
  console.log(`🔍 ${events.length - filtered.length} duplicates removed, ${filtered.length} new events`);
  return filtered;
}

// ── Step 3: Save to Firestore ─────────────
async function saveEvents(events) {
  if (!events.length) { console.log("⚠️  No new events to save."); return; }

  const batch = db.batch();
  for (const e of events) {
    const ref = db.collection("events").doc();
    batch.set(ref, {
      title:         e.title,
      category:      e.category,
      tags:          e.tags || [],
      endsAt:        e.endsAt,
      options:       e.options.map(o => ({ ...o, votes: 0, pool: 0 })),
      totalPool:     0,
      resolved:      false,
      winner:        null,
      isOfficial:    true,           // marks as admin/official event
      createdBy:     ADMIN_UID,
      createdByName: "PredictIndia Official",
      createdAt:     Timestamp.now(),
      generatedDate: TODAY,
    });
  }

  await batch.commit();
  console.log(`🚀 Saved ${events.length} events to Firestore!`);
}

// ── Main ──────────────────────────────────
async function main() {
  try {
    if (!ADMIN_UID)   throw new Error("ADMIN_UID env var missing");
    if (!GEMINI_KEY)  throw new Error("GEMINI_API_KEY env var missing");
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) throw new Error("FIREBASE_SERVICE_ACCOUNT env var missing");

    const raw      = await generateEvents();
    const filtered = await filterDuplicates(raw);
    await saveEvents(filtered);
    console.log("✅ Daily event pipeline complete!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Pipeline failed:", err.message);
    process.exit(1);
  }
}

main();
