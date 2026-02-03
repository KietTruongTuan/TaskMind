"use client";
import { AddStep } from "@/app/enum/step.enum";
import { GoalAdd } from "../goal-add/goal-add";
import { GoalReview } from "../../../components/goal-review/goal-review";
import { useState } from "react";
import { CreateGoalResponseBody } from "@/app/constants";

export function AddGoalWrapper() {
  const [step, setStep] = useState<AddStep>(AddStep.FillInformation);
  const storedGoal = localStorage.getItem("draftGoal");
  const draftGoal: CreateGoalResponseBody = storedGoal
    ? JSON.parse(storedGoal)
    : {};
  const stepComponents = {
    [AddStep.FillInformation]: <GoalAdd setStep={setStep} />,
    [AddStep.ReviewDetail]: (
      <GoalReview setStep={setStep} goalData={draftGoal} isDraft />
    ),
  };
  return stepComponents[step];
}
