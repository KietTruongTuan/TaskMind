"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { CreateGoalResponseBody } from "@/app/constants";

const GoalContext = createContext<{
  draftGoal: CreateGoalResponseBody | null;
  setDraftGoal: (goal: CreateGoalResponseBody) => void;
  clearDraftGoal: () => void;
} | null>(null);

export function GoalProvider({ children }: { children: ReactNode }) {
  const [draftGoal, setDraftGoal] = useState<CreateGoalResponseBody | null>(null);

  const handleSetDraftGoal = (goal: CreateGoalResponseBody) => {
    setDraftGoal(goal);
  };

  const handleClearDraftGoal = () => {
    setDraftGoal(null);
  };

  return (
    <GoalContext.Provider
      value={{
        draftGoal,
        setDraftGoal: handleSetDraftGoal,
        clearDraftGoal: handleClearDraftGoal,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export function useGoalContext() {
  const context = useContext(GoalContext);
  if (!context) throw new Error("useGoalContext must be used inside GoalProvider");
  return context;
}