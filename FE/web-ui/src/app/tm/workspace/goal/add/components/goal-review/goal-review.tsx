import { CustomButton } from "@/app/components/custom-button/custom-button";
import { GoalCard } from "@/app/components/goal-card/goal-card";
import { TaskList } from "@/app/components/task-list/task-list";
import { CreateGoalResponseBody } from "@/app/constants";
import { ButtonType } from "@/app/enum/button-type.enum";
import { Status } from "@/app/enum/status.enum";
import { AddStep } from "@/app/enum/step.enum";
import { Flex } from "@radix-ui/themes";
import { Dispatch, SetStateAction } from "react";

export function GoalReview({
  setStep,
  goalData,
}: {
  setStep: Dispatch<SetStateAction<AddStep>>;
  goalData: CreateGoalResponseBody;
}) {
  const {
    name,
    description,
    status,
    tasks,
    completedDate,
    completeCount,
    taskCount,
    tag,
    deadline,
  } = goalData;
  const handleCancel = () => {
    setStep(AddStep.FillInformation);
  };
  return (
    <Flex width="100%" justify="center" align="center" height="100%">
      <Flex
        width={{ initial: "90%", xs: "85%" }}
        direction="column"
        py="5"
        gap="5"
      >
        <Flex width="100%" justify="end" gap="1">
          <CustomButton
            buttonType={ButtonType.Secondary}
            onClick={handleCancel}
          >
            Cancel
          </CustomButton>
          <CustomButton buttonType={ButtonType.Primary}>Save</CustomButton>
        </Flex>
        <GoalCard
          name={name || ""}
          description={description || ""}
          status={status || Status.ToDo}
          completedDate={completedDate ? new Date(completedDate) : undefined}
          completedCount={completeCount || 0}
          taskCount={taskCount || 0}
          tag={tag || []}
          deadline={new Date(deadline) || new Date()}
          isDetailCard
          isPrimary
        />
        <TaskList tasks={tasks} />
      </Flex>
    </Flex>
  );
}
