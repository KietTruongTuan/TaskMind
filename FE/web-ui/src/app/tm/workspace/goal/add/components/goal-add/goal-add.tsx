"use client";
import { FormProvider, useForm } from "react-hook-form";
import * as Form from "@radix-ui/react-form";
import { Flex, Text } from "@radix-ui/themes";
import { Header } from "@/app/components/header/header";
import { Sparkles } from "lucide-react";
import styles from "./goal-add.module.scss";
import { GoalAddForm } from "../goal-add-form/goal-add-form";
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { AddStep } from "@/app/enum/step.enum";
import { Dispatch, SetStateAction } from "react";
import { LoadingOverlay } from "@/app/components/loading-overlay/loading-overlay";
import { aiService, CreateGoalRequestBody, CreateGoalResponseBody } from "@/app/constants";

export function GoalAdd({
  setStep,
}: {
  setStep: Dispatch<SetStateAction<AddStep>>;
}) {
  const methods = useForm<CreateGoalRequestBody>({
    mode: "onTouched",
    defaultValues: {},
  });

  const {
    handleSubmit,
    formState: { isValid, isSubmitting },
    getValues,
  } = methods;
  
  const onSubmit = async () => {
    const data = getValues();
    const draftGoalData: CreateGoalResponseBody =  await aiService.createGoal(data);
    localStorage.setItem("draftGoal", JSON.stringify(draftGoalData));
    setStep(AddStep.ReviewDetail);
  };

  return (
    <>
      <LoadingOverlay isLoading={isSubmitting} />
      <Flex width="100%" justify="center" align="center" height="92vh">
        <Flex
          width={{ initial: "90%", xs: "50%" }}
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
                  <Flex direction="column" width="100%" gap="1" data-testid="goal-add-header">
                    <Header
                      text="Let AI help you create a new goal"
                      subText="Type your goal and let AI create a detailed step-by-step plan for you."
                      textSize="2"
                      subTextSize="2"
                      icon={<Sparkles size={18} />}
                    />
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
    </>
  );
}
