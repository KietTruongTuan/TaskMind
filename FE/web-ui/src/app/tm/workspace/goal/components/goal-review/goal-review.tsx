"use client"
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { GoalCard } from "@/app/components/goal-card/goal-card";
import {
  TabContainer,
  TabListProps,
} from "@/app/components/tab-container/tab-container";
import { TaskList } from "@/app/components/task-list/task-list";
import {
  ApiError,
  CreateGoalResponseBody,
  goalService,
  SaveGoalRequestBody,
} from "@/app/constants";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { ButtonType } from "@/app/enum/button-type.enum";
import { Status } from "@/app/enum/status.enum";
import { AddStep } from "@/app/enum/step.enum";
import { WebUrl } from "@/app/enum/web-url.enum";
import { Flex } from "@radix-ui/themes";
import { Clock, Kanban, ListCheck, ListChecks } from "lucide-react";
import { Dispatch, SetStateAction } from "react";

export function GoalReview({
  setStep,
  goalData,
  isDraft = false,
}: {
  setStep?: Dispatch<SetStateAction<AddStep>>;
  goalData: CreateGoalResponseBody;
  isDraft?: boolean;
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

  const { route } = useRouteLoadingContext();
  const { showToast, setIsSuccess } = useToast();

  const handleCancel = () => {
    setStep && setStep(AddStep.FillInformation);
  };

  const handleSave = async () => {
    try {
      await goalService.save(goalData as SaveGoalRequestBody);
      route(WebUrl.Dashboard);
      setIsSuccess(true);
      showToast("Your goal is successfully saved");
    } catch (err) {
      setIsSuccess(false);
      const error = err as ApiError;
      showToast(error.message);
    }
  };
  const tabList: TabListProps[] = [
    {
      label: "List",
      component: <TaskList tasks={tasks} />,
      icon: <ListChecks size={15} />,
    },
    {
      label: "History",
      component: <div>History View Coming Soon!</div>,
      icon: <Clock size={15} />,
    },
    {
      label: "Board",
      component: <div>Board View Coming Soon!</div>,
      icon: <Kanban size={15} />,
    },
  ];
  return (
    <Flex width="100%" justify="center" align="center" height="100%">
      <Flex
        width={{ initial: "90%", xs: "85%" }}
        direction="column"
        py="5"
        gap="5"
      >
        {isDraft && (
          <Flex width="100%" justify="end" gap="1">
            <CustomButton
              buttonType={ButtonType.Secondary}
              onClick={handleCancel}
            >
              Cancel
            </CustomButton>
            <CustomButton buttonType={ButtonType.Primary} onClick={handleSave}>
              Save
            </CustomButton>
          </Flex>
        )}

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
          isDraft={isDraft}
        />
        <TabContainer tabList={tabList} isDraft = {isDraft}/>
      </Flex>
    </Flex>
  );
}
