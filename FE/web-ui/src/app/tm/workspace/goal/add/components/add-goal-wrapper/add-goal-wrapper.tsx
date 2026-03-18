"use client";
import { AddStep } from "@/app/enum/step.enum";
import { GoalAdd } from "../goal-add/goal-add";
import { GoalReview } from "../../../components/goal-review/goal-review";
import { useState } from "react";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";

export function AddGoalWrapper() {
  const [step, setStep] = useState<AddStep>(AddStep.FillInformation);
  const { draftGoal } = useGoalContext();

  const stepComponents = {
    [AddStep.FillInformation]: <GoalAdd setStep={setStep} />,
    [AddStep.ReviewDetail]: draftGoal ? (
      <GoalReview setStep={setStep} goalData={draftGoal} />
    ) : null,
  };
  return stepComponents[step];
}
