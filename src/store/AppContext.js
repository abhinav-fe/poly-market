"use client";

import { createContext, useContext, useReducer, useState, useCallback } from "react";
import { appReducer, initialState } from "@/store/reducer";
import { getRank } from "@/utils/helpers";

const AppContext = createContext(null);
export const useApp = () => useContext(AppContext);

export function AppProvider({ children }) {
  const [state,  dispatch] = useReducer(appReducer, initialState);
  const [toast,  setToast] = useState(null);
  const [modal,  setModal] = useState(null);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const placePrediction = useCallback((eventId, optionId, stake) => {
    const me = state.users.find(u => u.id === "you");
    if (stake > me.tokens)            { showToast("Not enough tokens!", "error"); return false; }
    if (state.myPredictions[eventId]) { showToast("Already predicted!", "error"); return false; }
    dispatch({ type: "PLACE_PREDICTION", payload: { eventId, optionId, stake } });
    showToast(`Staked 🪙 ${stake} tokens!`);
    return true;
  }, [state.users, state.myPredictions, showToast]);

  const createEvent = useCallback((payload) => {
    dispatch({ type: "CREATE_EVENT", payload });
    showToast("Event created! 🎉");
  }, [showToast]);

  const me          = state.users.find(u => u.id === "you");
  const myRank      = getRank(state.users, "you");
  const leaderboard = [...state.users].sort((a, b) => b.tokens - a.tokens).map((u, i) => ({ ...u, rank: i + 1 }));

  return (
    <AppContext.Provider value={{
      ...state, me, myRank, leaderboard,
      toast, modal, setModal,
      placePrediction, createEvent, showToast,
    }}>
      {children}
    </AppContext.Provider>
  );
}
