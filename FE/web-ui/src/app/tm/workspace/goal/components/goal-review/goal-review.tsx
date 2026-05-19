"use client";
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { GoalCard } from "@/app/components/goal-card/goal-card";
import { KanbanBoard } from "@/app/components/kanban-board/kanban-board";
import { SearchBar } from "@/app/components/search-bar/search-bar";
import {
  TabContainer,
  TabListProps,
} from "@/app/components/tab-container/tab-container";
import { TaskList } from "@/app/components/task-list/task-list";
import {
  CreateGoalResponseBody,
  GoalDetailResponseBody,
  Task,
} from "@/app/constants";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { ButtonType } from "@/app/enum/button-type.enum";
import { Status } from "@/app/enum/status.enum";
import { Flex, Text } from "@radix-ui/themes";
import { ArrowLeft, Kanban, ListChecks } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function GoalReview({
  goalData,
  isDraft = false,
}: {
  goalData: CreateGoalResponseBody | GoalDetailResponseBody;
  isDraft?: boolean;
}) {
  const {
    name,
    description,
    status,
    tasks,
    completedDate,
    completedCount,
    taskCount,
    tag,
    deadline,
  } = goalData;
  const router = useRouter();

  const [localCompletedCount, setLocalCompletedCount] =
    useState(completedCount);
  const [localTaskCount, setLocalTaskCount] = useState(taskCount);
  const [localTasks, setLocalTasks] = useState(tasks);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchTask = (searchValue: string) => {
    setSearchValue(searchValue);
    setLocalTasks(
      tasks?.filter((task) =>
        task.name.toLowerCase().includes(searchValue.toLowerCase()),
      ),
    );
  };

  const handleTaskStatusChange = (oldStatus: Status, newStatus: Status) => {
    if (oldStatus !== newStatus) {
      if (newStatus === Status.Completed) {
        setLocalCompletedCount((prev) => prev + 1);
      } else if (oldStatus === Status.Completed) {
        setLocalCompletedCount((prev) => Math.max(0, prev - 1));
      }
    }
  };

  const handleTaskCountChange = (isDelete?: boolean) => {
    setLocalTaskCount((prev) => (isDelete ? Math.max(0, prev - 1) : prev + 1));
  };

  const tabList: TabListProps[] = [
    {
      label: "List",
      component: localTasks ? (
        <Flex direction="column" gap="5" height="100%" width="100%">
          <Flex width="70%">
            <SearchBar value={searchValue} onClientSearch={handleSearchTask} />
          </Flex>
          <TaskList
            tasks={localTasks}
            goalId={(goalData as GoalDetailResponseBody).id}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskCountChange={handleTaskCountChange}
            setTasksLocal={setLocalTasks}
          />
        </Flex>
      ) : (
        <Flex height="100%" align="center" justify="center" p="5">
          No tasks exist
        </Flex>
      ),
      icon: <ListChecks size={15} />,
    },
    {
      label: "Board",
      component: localTasks ? (
        <Flex direction="column" gap="5" height="100%" width="100%">
          <Flex width="70%">
            <SearchBar value={searchValue} onClientSearch={handleSearchTask} />
          </Flex>
          <KanbanBoard
            tasks={localTasks as Task[]}
            onTaskStatusChange={handleTaskStatusChange}
            setTasksLocal={setLocalTasks}
            isLocal
          />
        </Flex>
      ) : (
        <Flex height="100%" align="center" justify="center" p="5">
          No tasks exist
        </Flex>
      ),
      icon: <Kanban size={15} />,
    },
  ];
  return (
    <Flex width="100%" justify="center" align="center" height="100%" px={isDraft ? "7" : ""} maxWidth= { { initial: "150vw", xs: "100%"}}>
      <Flex width="100%" direction="column" py="5" gap="5" height="100%">
        {!isDraft && (
          <Flex justify="start">
            <CustomButton
              buttonType={ButtonType.Secondary}
              onClick={() => router.back()}
            >
              <ArrowLeft size={15} />
              <Text size="2">Back</Text>
            </CustomButton>
          </Flex>
        )}

        <GoalCard
          id={(goalData as GoalDetailResponseBody).id || ""}
          name={name || ""}
          description={description || ""}
          status={status || Status.ToDo}
          completedDate={completedDate ? new Date(completedDate) : undefined}
          completedCount={localCompletedCount}
          taskCount={localTaskCount || 0}
          tag={tag || []}
          deadline={new Date(deadline) || new Date()}
          isDetailCard
          isPrimary
          isDraft={isDraft}
        />
        <TabContainer tabList={tabList} isDraft={isDraft} />
      </Flex>
    </Flex>
  );
}
