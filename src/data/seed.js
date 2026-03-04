export const SEED_EVENTS = [
  { id: 1, title: "Will India win the 2025 Champions Trophy?", category: "Cricket", endsAt: "2025-03-15", totalPool: 48200, options: [{ id: "yes", label: "Yes 🏆", votes: 312, pool: 31000 }, { id: "no", label: "No ❌", votes: 188, pool: 17200 }], resolved: false, winner: null, createdBy: "Rahul_Mumbai", tags: ["ICC", "Champions Trophy", "BCCI"] },
  { id: 2, title: "Will Jio launch a budget 5G phone under ₹5000 by mid-2025?", category: "Tech", endsAt: "2025-06-30", totalPool: 22500, options: [{ id: "yes", label: "Yes 📱", votes: 210, pool: 14000 }, { id: "no", label: "No 🙅", votes: 95, pool: 8500 }], resolved: false, winner: null, createdBy: "TechWatcher_Delhi", tags: ["Jio", "5G", "Reliance"] },
  { id: 3, title: "Deepika Padukone to win Filmfare Best Actress 2025?", category: "Bollywood", endsAt: "2025-02-28", totalPool: 19800, options: [{ id: "yes", label: "Yes ⭐", votes: 430, pool: 13000 }, { id: "no", label: "No 🎬", votes: 270, pool: 6800 }], resolved: true, winner: "yes", createdBy: "BollywoodBuzz", tags: ["Filmfare", "Deepika", "Awards"] },
  { id: 4, title: "Will BJP retain power in Delhi Assembly elections?", category: "Politics", endsAt: "2025-02-10", totalPool: 67000, options: [{ id: "yes", label: "Yes 🪷", votes: 502, pool: 41000 }, { id: "no", label: "No 🌱", votes: 398, pool: 26000 }], resolved: true, winner: "yes", createdBy: "PoliticsFirst", tags: ["Delhi", "Elections", "BJP"] },
  { id: 5, title: "Will RBI cut repo rate in April 2025 policy meet?", category: "Economy", endsAt: "2025-04-10", totalPool: 31000, options: [{ id: "yes", label: "Yes 📉", votes: 280, pool: 21000 }, { id: "no", label: "No 📈", votes: 120, pool: 10000 }], resolved: false, winner: null, createdBy: "FinanceGuru_Pune", tags: ["RBI", "Repo Rate", "Economy"] },
];

export const SEED_USERS = [
  { id: "you", name: "You",               avatar: "🧑", tokens: 1000, correct: 2,  total: 3  },
  { id: "u1",  name: "Rahul_Mumbai",      avatar: "👨", tokens: 3400, correct: 18, total: 22 },
  { id: "u2",  name: "PredictorQueen",    avatar: "👩", tokens: 5100, correct: 31, total: 38 },
  { id: "u3",  name: "BollywoodBuzz",     avatar: "🎬", tokens: 2200, correct: 12, total: 17 },
  { id: "u4",  name: "PoliticsFirst",     avatar: "🏛️", tokens: 4800, correct: 27, total: 32 },
  { id: "u5",  name: "TechWatcher_Delhi", avatar: "💻", tokens: 1900, correct: 9,  total: 14 },
  { id: "u6",  name: "FinanceGuru_Pune",  avatar: "💰", tokens: 2700, correct: 15, total: 20 },
];

export const SEED_PREDICTIONS = { 3: "yes", 4: "yes" };
export const SEED_STAKES      = { 3: 200,   4: 300   };
