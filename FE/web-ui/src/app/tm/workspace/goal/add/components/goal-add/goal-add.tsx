"use client";
import axios from "axios";
import { FormProvider, useForm } from "react-hook-form";
import * as Form from "@radix-ui/react-form";
import { DropdownMenu, Flex, Switch, Text } from "@radix-ui/themes";
import { Header } from "@/app/components/header/header";
import { Settings, Sparkles } from "lucide-react";
import styles from "./goal-add.module.scss";
import { GoalAddForm } from "../goal-add-form/goal-add-form";
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { AddStep } from "@/app/enum/step.enum";
import { Dispatch, SetStateAction, useState } from "react";
import {
  aiService,
  ApiError,
  authenticationService,
  CreateGoalRequestBody,
  CreateGoalResponseBody,
} from "@/app/constants";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { ToastType } from "@/app/enum/toast-type.enum";

export function GoalAdd({
  setStep,
  enableGlobalKb,
  enableLocalKb,
}: {
  setStep: Dispatch<SetStateAction<AddStep>>;
  enableGlobalKb: boolean;
  enableLocalKb: boolean;
}) {
  const [isEnableLocalKb, setEnableLocalKb] = useState(enableLocalKb);
  const [isEnableGlobalKb, setEnableGlobalKb] = useState(enableGlobalKb);

  const methods = useForm<CreateGoalRequestBody>({
    mode: "onTouched",
    defaultValues: {},
  });

  const {
    handleSubmit,
    formState: { isValid },
    getValues,
  } = methods;
  const { setDraftGoal, setCreateRequest, setAbortController } =
    useGoalContext();
  const { showToast, setToastType } = useToast();

  const onSubmit = async () => {
    try {
      setStep(AddStep.ReviewDetail);
      const data = getValues();
      let requestData: CreateGoalRequestBody | FormData = data;

      if (data.files && data.files.length > 0) {
        const formData = new FormData();
        formData.append("name", data.name);
        if (data.description) formData.append("description", data.description);
        if (data.deadline)
          formData.append(
            "deadline",
            new Date(data.deadline).toISOString().split("T")[0],
          );
        if (data.tag) {
          data.tag.forEach((t) => formData.append("tag", t));
        }
        data.files.forEach((file) => {
          formData.append("files", file);
        });
        requestData = formData;
      }
      const controller = new AbortController();
      setAbortController(controller);
      const draftGoalData: CreateGoalResponseBody = await aiService.createGoal(
        requestData,
        { signal: controller.signal },
      );

      setCreateRequest(data);

      setDraftGoal({
        ...draftGoalData,
        tasks: draftGoalData.tasks?.map((t, index) => ({
          ...t,
          index: index,
        })),
      });
    } catch (err) {
      if (axios.isCancel(err)) {
        setToastType(ToastType.Error);
        showToast("Request canceled");
      } else {
        setStep(AddStep.FillInformation);
        setToastType(ToastType.Error);
        const error = err as ApiError;
        showToast(error.message);
      }
    }
  };
  const handleToggleLocalKb = async () => {
    try {
      setEnableLocalKb((prev) => !prev);
      await authenticationService.toggleLocalKnowledgeBase();
    } catch (err) {
      setEnableLocalKb((prev) => !prev);
      setToastType(ToastType.Error);
      const error = err as ApiError;
      showToast(error.message);
    }
  };

  const handleToggleGlobalKb = async () => {
    try {
      setEnableGlobalKb((prev) => !prev);
      await authenticationService.toggleGlobalKnowledgeBase();
    } catch (err) {
      setEnableGlobalKb((prev) => !prev);
      setToastType(ToastType.Error);
      const error = err as ApiError;
      showToast(error.message);
    }
  };
  return (
    <Flex width="100%" justify="center" align="center" height="92vh">
      <Flex
        width={{ initial: "100%", md: "50%" }}
        direction="column"
        py="5"
        gap="5"
      >
        <CardNoPadding py="5" px="5" isPrimary>
          <FormProvider {...methods}>
            <Form.Root
              className={styles.formWrapper}
              onSubmit={handleSubmit(onSubmit)}
            >
              <Flex direction="column" gap="4">
                <Flex justify="between">
                  <Flex
                    direction="column"
                    width="100%"
                    gap="1"
                    data-testid="goal-add-header"
                  >
                    <Header
                      text="Let AI help you create a new goal"
                      subText="Type your goal and let AI create a detailed step-by-step plan for you."
                      textSize="2"
                      subTextSize="2"
                      icon={<Sparkles size={18} />}
                    />
                  </Flex>
                  <DropdownMenu.Root modal={false}>
                    <DropdownMenu.Trigger data-testid="settings-button">
                      <Settings size={18} cursor="pointer" />
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content variant="soft" color="gray">
                      <Flex direction="column" gap="2" px="2" py="2">
                        <Text size="2" weight="medium">
                          Settings
                        </Text>
                        <Flex direction="column" gap="3">
                          <Flex align="center" gap="2">
                            <Switch
                              defaultChecked={isEnableLocalKb}
                              onCheckedChange={handleToggleLocalKb}
                              color="gray"
                              highContrast
                              data-testid="toggle-local-kb"
                            />
                            <Text size="1">Use my knowledge base</Text>
                          </Flex>
                          <Flex align="center" gap="2">
                            <Switch
                              defaultChecked={isEnableGlobalKb}
                              onCheckedChange={handleToggleGlobalKb}
                              color="gray"
                              highContrast
                              data-testid="toggle-global-kb"
                            />
                            <Text size="1">Use system knowledge base</Text>
                          </Flex>
                        </Flex>
                      </Flex>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Flex>

                <GoalAddForm />
                <CustomButton
                  type="submit"
                  disabled={!isValid}
                  buttonType={ButtonType.Primary}
                  data-testid="goal-add-button"
                >
                  <Sparkles size={18} />
                  Create your plan
                </CustomButton>
                <CardNoPadding p="4">
                  <Flex direction="column" width="100%" gap="1">
                    <Flex direction="column" gap="2">
                      <Text size="2" weight="medium">
                        AI will help you:
                      </Text>
                      <Flex direction="column" gap="1">
                        <Text size="2" className={styles.subText}>
                          • Break down your goal into specific steps
                        </Text>
                        <Text size="2" className={styles.subText}>
                          • Build a detailed timeline for your plan
                        </Text>
                        <Text size="2" className={styles.subText}>
                          • Suggest supporting resources
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </CardNoPadding>
              </Flex>
            </Form.Root>
          </FormProvider>
        </CardNoPadding>
      </Flex>
    </Flex>
  );
}
