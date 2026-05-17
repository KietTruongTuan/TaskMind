"use client";
import { AddStep } from "@/app/enum/step.enum";
import { GoalAdd } from "../goal-add/goal-add";
import { GoalReview } from "../../../components/goal-review/goal-review";
import { useState, useEffect } from "react";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { Box, Flex, Grid, ScrollArea, Text } from "@radix-ui/themes";
import { LoadingText } from "@/app/components/loading-text/loading-text";
import { ThreeDotLoading } from "@/app/components/three-dot-loading/three-dot-loading";
import { GoalChat } from "../goal-chat/goal-chat";
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";
import { ArrowLeft, Save } from "lucide-react";
import styles from "./add-goal-wrapper.module.scss";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import { goalService, SaveGoalRequestBody, ApiError } from "@/app/constants";
import { WebUrl } from "@/app/enum/web-url.enum";
import { buildUrl } from "@/app/tm/utils";

export function AddGoalWrapper() {
  const [step, setStep] = useState<AddStep>(AddStep.FillInformation);
  const { draftGoal, clearDraftGoal } = useGoalContext();
  const [draftCreateGoal, setDraftCreateGoal] = useState(
    draftGoal
      ? {
          ...draftGoal,
          completedCount: draftGoal?.completedCount || 0,
        }
      : null,
  );
  const { route, setIsRouteLoading } = useRouteLoadingContext();
  const { showToast, setIsSuccess } = useToast();
  useEffect(() => {
    setDraftCreateGoal(
      draftGoal
        ? {
            ...draftGoal,
            completedCount: draftGoal?.completedCount || 0,
          }
        : null,
    );
  }, [draftGoal]);

  const handleBack = () => {
    clearDraftGoal();
    setStep(AddStep.FillInformation);
  };

  const handleSave = async () => {
    try {
      setIsRouteLoading(true);
      const data = await goalService.save(
        draftCreateGoal as SaveGoalRequestBody,
      );
      route(buildUrl(WebUrl.GoalDetail, data.id));
      setIsSuccess(true);
      showToast("Your goal is successfully saved");
    } catch (err) {
      setIsSuccess(false);
      const error = err as ApiError;
      showToast(error.message);
    } finally {
      setIsRouteLoading(false);
    }
  };
  const stepComponents = {
    [AddStep.FillInformation]: <GoalAdd setStep={setStep} />,
    [AddStep.ReviewDetail]: (
      <Grid
        columns="1fr 2fr"
        rows="auto 1fr "
        height="calc(100% + var(--space-4))"
        mx="-7"
        mb="-4"
        width="calc(100% + var(--space-7) * 2)"
      >
        <Flex
          width="100%"
          justify="between"
          py="2"
          px="3"
          gap="1"
          className={styles.topBar}
          gridColumnEnd="3"
          gridColumnStart="1"
          gridRow="1"
        >
          <CustomButton buttonType={ButtonType.Secondary} onClick={handleBack} data-testid="back-button">
            <ArrowLeft size={15} />
            <Text size="2">Back</Text>
          </CustomButton>
          <CustomButton
            buttonType={ButtonType.Primary}
            onClick={handleSave}
            disabled={!draftCreateGoal}
          >
            <Save size={15} />
            <Text size="2">Save</Text>
          </CustomButton>
        </Flex>
        <GoalChat />
        <ScrollArea
          scrollbars="vertical"
          style={{ maxHeight: "87vh", gridRow: "2", gridColumn: "2" }}
        >
          <Flex direction="column" height="100%">
            {draftCreateGoal ? (
              <GoalReview goalData={draftCreateGoal} isDraft />
            ) : (
              <Flex align="center" justify="center" height="100%" width="100%">
                <LoadingText
                  text="Generating"
                  textSize="4"
                  specialEffectComponent={<ThreeDotLoading />}
                />
              </Flex>
            )}
          </Flex>
        </ScrollArea>
      </Grid>
    ),
  };
  return stepComponents[step];
}
