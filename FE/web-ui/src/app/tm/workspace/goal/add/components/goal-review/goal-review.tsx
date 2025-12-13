import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { GoalCard } from "@/app/components/goal-card/goal-card";
import { TaskList } from "@/app/components/task-list/task-list";
import { Task } from "@/app/constants/task.constants";
import { ButtonType } from "@/app/enum/button-type.enum";
import { Status } from "@/app/enum/status.enum";
import { AddStep } from "@/app/enum/step.enum";
import { Flex } from "@radix-ui/themes";
import { Dispatch, SetStateAction } from "react";

export function GoalReview({
  setStep,
}: {
  setStep: Dispatch<SetStateAction<AddStep>>;
}) {
  const tasks: Task[] = [
    {
      id: 1,
      name: "Understand how components work",
      position: 1,
      status: Status.Completed,
      deadline: new Date("2025-08-15"),
    },
    {
      id: 2,
      name: "Learn about Props and State",
      position: 2,
      status: Status.Completed,
      deadline: new Date("2025-08-15"),
    },
    {
      id: 3,
      name: "Study Component Lifecycle",
      position: 3,
      status: Status.Completed,
      deadline: new Date("2025-08-15"),
    },
    {
      id: 4,
      name: "Practice using simple components",
      position: 4,
      status: Status.Completed,
      deadline: new Date("2025-08-15"),
    },
    {
      id: 5,
      name: "Learn useState and useEffect",
      position: 5,
      status: Status.InProgress,
      deadline: new Date("2025-09-15"),
    },
    {
      id: 6,
      name: "Learn useContext and useReducer",
      position: 6,
      status: Status.ToDo,
      deadline: new Date("2025-09-15"),
    },
    {
      id: 7,
      name: "Learn advanced Hooks (useMemo, useCallback)",
      position: 7,
      status: Status.ToDo,
      deadline: new Date("2025-09-15"),
    },
    {
      id: 8,
      name: "Practice creating custom hooks",
      position: 8,
      status: Status.ToDo,
      deadline: new Date("2025-09-15"),
    },
    {
      id: 9,
      name: "Learn React Router",
      position: 9,
      status: Status.ToDo,
      deadline: new Date("2025-09-15"),
    },
    {
      id: 10,
      name: "Learn Redux Toolkit",
      position: 10,
      status: Status.ToDo,
      deadline: new Date("2025-09-15"),
    },
    {
      id: 11,
      name: "Build an application with complex routing",
      position: 11,
      status: Status.ToDo,
      deadline: new Date("2025-09-15"),
    },
    {
      id: 12,
      name: "Create a personal project plan",
      position: 12,
      status: Status.ToDo,
      deadline: new Date("2025-09-15"),
    },
  ];

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
          name="Learn React in 3 months"
          description="Learn React from basic to advanced, including Hooks, Context API, and common design patterns. The goal is to be able to build complete web applications with React."
          status={Status.InProgress}
          completedCount={11}
          taskCount={15}
          tag={["Study", "Frontend"]}
          deadline={new Date("2025-12-31")}
          progress={45}
          isDetailCard
          isPrimary
        />
        <TaskList tasks={tasks} />
      </Flex>
    </Flex>
  );
}
