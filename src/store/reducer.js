import { SEED_EVENTS, SEED_USERS, SEED_PREDICTIONS, SEED_STAKES } from "@/data/seed";

export const initialState = {
  events:        SEED_EVENTS,
  users:         SEED_USERS,
  myPredictions: SEED_PREDICTIONS,
  myStakes:      SEED_STAKES,
};

export function appReducer(state, action) {
  switch (action.type) {
    case "PLACE_PREDICTION": {
      const { eventId, optionId, stake } = action.payload;
      return {
        ...state,
        events: state.events.map(e => e.id !== eventId ? e : {
          ...e, totalPool: e.totalPool + stake,
          options: e.options.map(o => o.id === optionId ? { ...o, votes: o.votes + 1, pool: o.pool + stake } : o),
        }),
        users: state.users.map(u => u.id !== "you" ? u : { ...u, tokens: u.tokens - stake, total: u.total + 1 }),
        myPredictions: { ...state.myPredictions, [eventId]: optionId },
        myStakes:      { ...state.myStakes,      [eventId]: stake    },
      };
    }
    case "CREATE_EVENT": {
      const { title, category, endsAt, opt1, opt2, tags } = action.payload;
      return {
        ...state,
        events: [...state.events, {
          id: Date.now(), title, category, endsAt, totalPool: 0,
          options: [
            { id: "opt1", label: opt1, votes: 0, pool: 0 },
            { id: "opt2", label: opt2, votes: 0, pool: 0 },
          ],
          resolved: false, winner: null, createdBy: "You",
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        }],
      };
    }
    default: return state;
  }
}
