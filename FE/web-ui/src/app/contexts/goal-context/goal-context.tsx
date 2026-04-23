"use client";
import { createContext, useContext, useState, ReactNode } from "react";
import { CreateGoalRequestBody, CreateGoalResponseBody } from "@/app/constants";

const GoalContext = createContext<{
  draftGoal: CreateGoalResponseBody | null;
  createRequest: CreateGoalRequestBody | null;
  isDraftGoalFromChat: boolean;
  setDraftGoal: (goal: CreateGoalResponseBody | null, isFromChat?: boolean) => void;
  clearDraftGoal: () => void;
  setCreateRequest: (request: CreateGoalRequestBody) => void;
  clearCreateRequest: () => void;
} | null>(null);

export function GoalProvider({ children }: { children: ReactNode }) {
  const [draftGoal, setDraftGoal] = useState<CreateGoalResponseBody | null>(
    null,
  );
  const [isDraftGoalFromChat, setIsDraftGoalFromChat] = useState(false);
  const [createRequest, setCreateRequest] =
    useState<CreateGoalRequestBody | null>(null);

  const handleSetDraftGoal = (
    goal: CreateGoalResponseBody | null,
    isFromChat: boolean = false,
  ) => {
    setDraftGoal(goal);
    setIsDraftGoalFromChat(isFromChat);
  };

  const handleClearDraftGoal = () => {
    setDraftGoal(null);
  };

  const handleSetCreateRequest = (request: CreateGoalRequestBody) => {
    setCreateRequest(request);
  };

  const handleClearCreateRequest = () => {
    setCreateRequest(null);
  };

  return (
    <GoalContext.Provider
      value={{
        draftGoal,
        createRequest,
        isDraftGoalFromChat,
        setDraftGoal: handleSetDraftGoal,
        clearDraftGoal: handleClearDraftGoal,
        setCreateRequest: handleSetCreateRequest,
        clearCreateRequest: handleClearCreateRequest,
      }}
    >
      {children}
    </GoalContext.Provider>
  );
}

export function useGoalContext() {
  const context = useContext(GoalContext);
  if (!context)
    throw new Error("useGoalContext must be used inside GoalProvider");
  return context;
}
