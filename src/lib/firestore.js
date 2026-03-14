import {
  collection, doc, addDoc, getDoc, getDocs, setDoc, updateDoc,
  onSnapshot, query, orderBy, serverTimestamp, increment, where,
  runTransaction,
} from "firebase/firestore";
import { db } from "./firebase";

// ── Collections ──────────────────────────────
export const eventsCol   = () => collection(db, "events");
export const usersCol    = () => collection(db, "users");
export const predsCol    = (eventId) => collection(db, "events", eventId, "predictions");
export const commentsCol = (eventId) => collection(db, "events", eventId, "comments");

// ── User ─────────────────────────────────────

/** Create or update user doc on login */
export async function upsertUser(firebaseUser) {
  const ref = doc(db, "users", firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      uid:         firebaseUser.uid,
      displayName: firebaseUser.displayName || "Predictor",
      photoURL:    firebaseUser.photoURL    || null,
      email:       firebaseUser.email,
      tokens:      1000,   // starting balance
      correct:     0,
      total:       0,
      createdAt:   serverTimestamp(),
    });
  }
}

/** Get a single user */
export async function getUser(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

/** Realtime leaderboard listener */
export function subscribeLeaderboard(callback) {
  const q = query(usersCol(), orderBy("tokens", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d, i) => ({ id: d.id, rank: i + 1, ...d.data() })));
  });
}

// ── Events ───────────────────────────────────

/** Create a new event */
export async function createEvent(payload, user) {
  const { title, category, endsAt, opt1, opt2, tags } = payload;
  const ref = await addDoc(eventsCol(), {
    title, category, endsAt,
    tags:      tags.split(",").map(t => t.trim()).filter(Boolean),
    totalPool: 0,
    options: [
      { id: "opt1", label: opt1, votes: 0, pool: 0 },
      { id: "opt2", label: opt2, votes: 0, pool: 0 },
    ],
    resolved:        false,
    winner:          null,
    createdBy:       user.uid,
    createdByName:   user.displayName || user.email,
    createdAt:       serverTimestamp(),
  });
  return ref.id;
}

/** Realtime events listener */
export function subscribeEvents(callback) {
  const q = query(eventsCol(), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

/** Resolve an event — only creator can call this */
export async function resolveEvent(eventId, winnerId, currentUserId) {
  const ref  = doc(db, "events", eventId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Event not found");
  if (snap.data().createdBy !== currentUserId) throw new Error("Not authorized");

  // Mark event resolved
  await updateDoc(ref, { resolved: true, winner: winnerId });

  // Reward winners: get all predictions for this event
  const predsSnap = await getDocs(predsCol(eventId));
  const winners   = predsSnap.docs.filter(d => d.data().optionId === winnerId);
  const losers    = predsSnap.docs.filter(d => d.data().optionId !== winnerId);
  const loserPool = losers.reduce((s, d) => s + d.data().stake, 0);

  // Distribute loser pool proportionally among winners
  const winnerPool = winners.reduce((s, d) => s + d.data().stake, 0);
  for (const w of winners) {
    const { uid, stake } = w.data();
    const reward = winnerPool > 0 ? Math.floor((stake / winnerPool) * loserPool) : 0;
    await updateDoc(doc(db, "users", uid), {
      tokens:  increment(reward),
      correct: increment(1),
    });
  }
}

// ── Predictions ──────────────────────────────

/** Place a prediction — uses transaction to keep pool consistent */
export async function placePrediction(eventId, optionId, stake, user) {
  const eventRef = doc(db, "events", eventId);
  const predRef  = doc(db, "events", eventId, "predictions", user.uid);
  const userRef  = doc(db, "users", user.uid);

  await runTransaction(db, async (tx) => {
    const eventSnap = await tx.get(eventRef);
    const userSnap  = await tx.get(userRef);
    const predSnap  = await tx.get(predRef);

    if (!eventSnap.exists())  throw new Error("Event not found");
    if (predSnap.exists())    throw new Error("Already predicted");
    if (!userSnap.exists())   throw new Error("User not found");

    const tokens = userSnap.data().tokens;
    if (tokens < stake)       throw new Error("Not enough tokens");

    // Update event options pool
    const options = eventSnap.data().options.map(o =>
      o.id === optionId ? { ...o, votes: o.votes + 1, pool: o.pool + stake } : o
    );

    tx.update(eventRef, { options, totalPool: increment(stake) });
    tx.update(userRef,  { tokens: increment(-stake), total: increment(1) });
    tx.set(predRef, {
      uid:       user.uid,
      optionId,
      stake,
      createdAt: serverTimestamp(),
    });
  });
}

/** Get all predictions by a user */
export async function getUserPredictions(uid) {
  const eventsSnap = await getDocs(eventsCol());
  const results = [];
  for (const e of eventsSnap.docs) {
    const predSnap = await getDoc(doc(db, "events", e.id, "predictions", uid));
    if (predSnap.exists()) {
      results.push({ eventId: e.id, event: { id: e.id, ...e.data() }, ...predSnap.data() });
    }
  }
  return results;
}

// ── Comments ─────────────────────────────────

/** Post a comment */
export async function postComment(eventId, text, user) {
  await addDoc(commentsCol(eventId), {
    uid:         user.uid,
    displayName: user.displayName || user.email,
    photoURL:    user.photoURL || null,
    text,
    createdAt:   serverTimestamp(),
  });
}

/** Realtime comments listener */
export function subscribeComments(eventId, callback) {
  const q = query(commentsCol(eventId), orderBy("createdAt", "asc"));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
  });
}

// ── Edit / Delete / Archive ───────────────

/** Update an event — only creator or admin can call */
export async function updateEvent(eventId, updates, currentUserId) {
  const ref  = doc(db, "events", eventId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Event not found");

  const data      = snap.data();
  const isAdmin   = currentUserId === process.env.NEXT_PUBLIC_ADMIN_UID;
  const isCreator = data.createdBy === currentUserId;
  if (!isCreator && !isAdmin) throw new Error("Not authorized");
  if (data.resolved) throw new Error("Cannot edit a resolved event");

  // If options are being changed, ensure no predictions exist yet
  if (updates.options) {
    const predsSnap = await getDocs(predsCol(eventId));
    if (!predsSnap.empty) throw new Error("Cannot edit options after predictions have been placed");
  }

  await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
}

/** Permanently delete an event */
export async function deleteEvent(eventId, currentUserId) {
  const ref  = doc(db, "events", eventId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Event not found");

  const data      = snap.data();
  const isAdmin   = currentUserId === process.env.NEXT_PUBLIC_ADMIN_UID;
  const isCreator = data.createdBy === currentUserId;
  if (!isCreator && !isAdmin) throw new Error("Not authorized");

  // Delete all predictions subcollection first
  const predsSnap = await getDocs(predsCol(eventId));
  const batch     = db.batch();
  predsSnap.docs.forEach(d => batch.delete(d.ref));
  batch.delete(ref);
  await batch.commit();
}

/** Archive an event — hides from feed but keeps data */
export async function archiveEvent(eventId, currentUserId) {
  const ref  = doc(db, "events", eventId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Event not found");

  const data      = snap.data();
  const isAdmin   = currentUserId === process.env.NEXT_PUBLIC_ADMIN_UID;
  const isCreator = data.createdBy === currentUserId;
  if (!isCreator && !isAdmin) throw new Error("Not authorized");

  await updateDoc(ref, { archived: true, archivedAt: serverTimestamp() });
}

/** Unarchive an event */
export async function unarchiveEvent(eventId, currentUserId) {
  const ref  = doc(db, "events", eventId);
  const snap = await getDoc(ref);
  if (!snap.exists()) throw new Error("Event not found");

  const data      = snap.data();
  const isAdmin   = currentUserId === process.env.NEXT_PUBLIC_ADMIN_UID;
  const isCreator = data.createdBy === currentUserId;
  if (!isCreator && !isAdmin) throw new Error("Not authorized");

  await updateDoc(ref, { archived: false, archivedAt: null });
}
