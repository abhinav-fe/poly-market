import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Timestamp }      from "firebase-admin/firestore";

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}
const db = getFirestore();

const ADMIN_UID      = process.env.ADMIN_UID;
const GROQ_KEY       = process.env.GROQ_API_KEY;
const EVENTS_PER_RUN = 20;
const TODAY          = new Date().toISOString().split("T")[0];

const CATEGORIES = [
  "India Politics & Elections",
  "Cricket & Sports",
  "Bollywood & Entertainment",
  "Global Events",
  "Business & Economy",
  "Tech & Startups",
];

async function generateEvents() {
  console.log("🧠 Asking Groq to generate events...");

  const prompt = `
You are a prediction market curator. Today's date is ${TODAY}.
Generate ${EVENTS_PER_RUN} exciting prediction events for an India-focused prediction platform.

Categories (distribute evenly): ${CATEGORIES.join(", ")}

Rules:
- Based on real current or upcoming events
- Exactly 2 options per event (binary)
- Resolves within 7-90 days from ${TODAY}
- Be specific with real names, teams, companies
- Mix India and global events

Respond ONLY with a valid JSON array, no explanation, no markdown:
[
  {
    "title": "Will India beat Australia in the 3rd Test?",
    "category": "Cricket & Sports",
    "tags": ["India", "Australia", "Test Cricket"],
    "endsAt": "2025-01-05",
    "options": [
      { "id": "yes", "label": "Yes 🏏" },
      { "id": "no",  "label": "No ❌" }
    ]
  }
]`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${GROQ_KEY}`,
    },
    body: JSON.stringify({
      model:       "llama-3.3-70b-versatile",
      temperature: 0.8,
      max_tokens:  4000,
      messages: [
        { role: "system", content: "You are a prediction market curator. Always respond with valid JSON only. No explanation, no markdown, no backticks." },
        { role: "user",   content: prompt },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }

  const data  = await res.json();
  const raw   = data.choices?.[0]?.message?.content;
  if (!raw) throw new Error("No content in Groq response");

  const clean  = raw.replace(/```json|```/g, "").trim();
  const events = JSON.parse(clean);
  console.log(`✅ Groq generated ${events.length} events`);
  return events;
}

async function filterDuplicates(events) {
  const snap = await db.collection("events")
    .where("isOfficial", "==", true)
    .where("createdAt", ">=", Timestamp.fromDate(new Date(Date.now() - 3 * 86400000)))
    .get();
  const recentTitles = new Set(snap.docs.map(d => d.data().title.toLowerCase()));
  const filtered = events.filter(e => !recentTitles.has(e.title.toLowerCase()));
  console.log(`🔍 ${events.length - filtered.length} duplicates removed, ${filtered.length} new events`);
  return filtered;
}

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
      isOfficial:    true,
      createdBy:     ADMIN_UID,
      createdByName: "PredictIndia Official",
      createdAt:     Timestamp.now(),
      generatedDate: TODAY,
    });
  }
  await batch.commit();
  console.log(`🚀 Saved ${events.length} events to Firestore!`);
}

async function main() {
  try {
    if (!ADMIN_UID) throw new Error("ADMIN_UID env var missing");
    if (!GROQ_KEY)  throw new Error("GROQ_API_KEY env var missing");
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