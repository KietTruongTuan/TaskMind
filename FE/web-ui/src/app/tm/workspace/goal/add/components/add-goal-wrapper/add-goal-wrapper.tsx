"use client";
import { AddStep } from "@/app/enum/step.enum";
import { GoalAdd } from "../goal-add/goal-add";
import { GoalReview } from "../../../components/goal-review/goal-review";
import { useState } from "react";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { Flex, Grid, ScrollArea } from "@radix-ui/themes";
import { LoadingText } from "@/app/components/loading-text/loading-text";
import { ThreeDotLoading } from "@/app/components/three-dot-loading/three-dot-loading";
import { GoalChat } from "../goal-chat/goal-chat";
import { useEffect } from "react";

export function AddGoalWrapper() {
  const [step, setStep] = useState<AddStep>(AddStep.FillInformation);
  const { draftGoal } = useGoalContext();
  const [draftCreateGoal, setDraftCreateGoal] = useState(draftGoal);

  useEffect(() => { 
    setDraftCreateGoal(draftGoal);
  }, [draftGoal]);

  const stepComponents = {
    [AddStep.FillInformation]: <GoalAdd setStep={setStep} />,
    [AddStep.ReviewDetail]: (
      <Grid
        columns="1fr 2fr"
        height="calc(100% + var(--space-4))"
        mx="-7"
        mb="-4"
        width="calc(100% + var(--space-7) * 2)"
      >
        <GoalChat />
        <ScrollArea scrollbars="vertical" style={{ maxHeight: "94vh" }}>
          {draftCreateGoal ? (
            <GoalReview
              setStep={setStep}
              goalData={{
                ...draftCreateGoal,
                completedCount: draftCreateGoal.completedCount || 0,
              }}
              isDraft
            />
          ) : (
            <Flex align="center" justify="center" height="100%" width="100%">
              <LoadingText
                text="Generating"
                textSize="4"
                specialEffectComponent={<ThreeDotLoading />}
              />
            </Flex>
          )}
        </ScrollArea>
      </Grid>
    ),
  };
  return stepComponents[step];
}
