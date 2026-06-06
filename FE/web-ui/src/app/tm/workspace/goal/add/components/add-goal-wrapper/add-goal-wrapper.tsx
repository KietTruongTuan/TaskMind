"use client";
import { AddStep, GoalAddReviewDetailView } from "@/app/enum/step.enum";
import { GoalAdd } from "../goal-add/goal-add";
import { GoalReview } from "../../../components/goal-review/goal-review";
import { useState, useEffect } from "react";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import {
  Box,
  DropdownMenu,
  Flex,
  Grid,
  ScrollArea,
  Strong,
  Text,
} from "@radix-ui/themes";
import { LoadingText } from "@/app/components/loading-text/loading-text";
import { ThreeDotLoading } from "@/app/components/three-dot-loading/three-dot-loading";
import { GoalChat } from "../goal-chat/goal-chat";
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";
import { ArrowLeft, BotMessageSquare, Eye, Save, Table2 } from "lucide-react";
import styles from "./add-goal-wrapper.module.scss";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import {
  goalService,
  SaveGoalRequestBody,
  ApiError,
  UserProfile,
} from "@/app/constants";
import { WebUrl } from "@/app/enum/web-url.enum";
import { buildUrl } from "@/app/tm/utils";
import useMediaQuery from "@mui/material/useMediaQuery";
import { AlertDialogPopUp } from "@/app/components/alert-dialog-pop-up/alert-dialog-pop-up";
import { ToastType } from "@/app/enum/toast-type.enum";

export function AddGoalWrapper({ userProfile }: { userProfile: UserProfile }) {
  const checkIsMd = useMediaQuery("(min-width:1024px)");
  const [isMd, setIsMd] = useState(checkIsMd);
  const [step, setStep] = useState<AddStep>(AddStep.FillInformation);
  const [activeView, setActiveView] = useState<GoalAddReviewDetailView>(
    isMd ? GoalAddReviewDetailView.Both : GoalAddReviewDetailView.ReviewDetail,
  );
  const [hasShownWarning, setHasShownWarning] = useState(false);
  const { draftGoal, clearDraftGoal, abortController, setAbortController } =
    useGoalContext();
  const [draftCreateGoal, setDraftCreateGoal] = useState(
    draftGoal
      ? {
          ...draftGoal,
          completedCount: draftGoal?.completedCount || 0,
        }
      : null,
  );
  const { route, setIsRouteLoading } = useRouteLoadingContext();
  const { showToast, setToastType, hideToast } = useToast();
  useEffect(() => {
    if (draftGoal?.isGeneralKnowledge && !hasShownWarning) {
      setHasShownWarning(true);
      setToastType(ToastType.Warning);
      showToast(
        <Flex direction="column" gap="2" data-testid="warning-toast">
          <Flex>
            <Text size="2" weight="regular">
              <Strong>Warning:</Strong> This plan was generated using
              generalized AI knowledge because no relevant information was found
              in your personal knowledge base or the system knowledge base.
            </Text>
          </Flex>
          <Flex justify="end" gap="2">
            <CustomButton
              buttonType={ButtonType.Secondary}
              size="1"
              onClick={() => {
                handleBack();
                hideToast();
              }}
              data-testid="warning-toast-back-btn"
            >
              Back
            </CustomButton>
            <CustomButton
              buttonType={ButtonType.Primary}
              size="1"
              onClick={() => {
                hideToast();
              }}
              data-testid="warning-toast-continue-btn"
            >
              Got it!
            </CustomButton>
          </Flex>
        </Flex>,
        10000,
        false,
      );
    }

    setDraftCreateGoal(
      draftGoal
        ? {
            ...draftGoal,
            completedCount: draftGoal?.completedCount || 0,
          }
        : null,
    );
  }, [draftGoal, hasShownWarning]);

  useEffect(() => {
    const updateMedia = () => setIsMd(window.innerWidth >= 1024);
    updateMedia();
    window.addEventListener("resize", updateMedia);
    return () => window.removeEventListener("resize", updateMedia);
  }, []);

  useEffect(() => {
    setActiveView(
      isMd
        ? GoalAddReviewDetailView.Both
        : GoalAddReviewDetailView.ReviewDetail,
    );
  }, [isMd]);

  const handleBack = () => {
    abortController?.abort();
    setAbortController(null);
    clearDraftGoal();
    setStep(AddStep.FillInformation);
    setHasShownWarning(false);
  };

  const handleSave = async () => {
    try {
      setIsRouteLoading(true);
      const data = await goalService.save(
        draftCreateGoal as SaveGoalRequestBody,
      );
      route(buildUrl(WebUrl.GoalDetail, data.id));
      setToastType(ToastType.Success);
      showToast("Your goal is successfully saved");
    } catch (err) {
      setToastType(ToastType.Error);
      const error = err as ApiError;
      showToast(error.message);
    } finally {
      setIsRouteLoading(false);
    }
  };
  const stepComponents = {
    [AddStep.FillInformation]: (
      <GoalAdd
        setStep={setStep}
        enableGlobalKb={userProfile.enableGlobalKb}
        enableLocalKb={userProfile.enableLocalKb}
      />
    ),
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
          <CustomButton
            buttonType={ButtonType.Secondary}
            onClick={handleBack}
            data-testid="back-button"
          >
            <ArrowLeft size={15} />
            <Text size="2">Back</Text>
          </CustomButton>
          <Flex gap="1">
            <DropdownMenu.Root modal={false}>
              <DropdownMenu.Trigger>
                <CustomButton
                  buttonType={ButtonType.Secondary}
                  data-testid="view-trigger"
                >
                  {activeView === GoalAddReviewDetailView.Both && (
                    <Table2 size={15} />
                  )}
                  {activeView === GoalAddReviewDetailView.Chat && (
                    <BotMessageSquare size={15} />
                  )}
                  {activeView === GoalAddReviewDetailView.ReviewDetail && (
                    <Eye size={15} />
                  )}
                </CustomButton>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content variant="soft" color="gray">
                {isMd && (
                  <DropdownMenu.Item
                    onClick={() => setActiveView(GoalAddReviewDetailView.Both)}
                  >
                    <Table2 size={15} />
                    Both
                  </DropdownMenu.Item>
                )}
                <DropdownMenu.Item
                  onClick={() => setActiveView(GoalAddReviewDetailView.Chat)}
                >
                  <BotMessageSquare size={15} />
                  Chat
                </DropdownMenu.Item>
                <DropdownMenu.Item
                  onClick={() =>
                    setActiveView(GoalAddReviewDetailView.ReviewDetail)
                  }
                >
                  <Eye size={15} />
                  Review
                </DropdownMenu.Item>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            <CustomButton
              buttonType={ButtonType.Primary}
              onClick={handleSave}
              disabled={!draftCreateGoal}
            >
              <Save size={15} />
              <Text size="2">Save</Text>
            </CustomButton>
          </Flex>
        </Flex>
        <GoalChat view={activeView} />
        <ScrollArea
          scrollbars="vertical"
          style={{
            maxHeight: "87vh",
            gridRow: "2",
            gridColumnStart:
              activeView === GoalAddReviewDetailView.ReviewDetail ? "1" : "2",
            gridColumnEnd: "3",
            display:
              activeView === GoalAddReviewDetailView.Chat ? "none" : "flex",
          }}
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
