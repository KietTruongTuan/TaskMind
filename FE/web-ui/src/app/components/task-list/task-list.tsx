import { Flex } from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { TaskListItem } from "../task-list-item/task-list-item";
import {
  ApiError,
  CreateGoalResponseBody,
  CreateTaskRequestBody,
  DraftTask,
  Task,
  taskService,
} from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { Trash2 } from "lucide-react";
import styles from "./task-list.module.scss";
import { useEffect, useState } from "react";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { CustomButton } from "../custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";
import { NewTaskListItem } from "../new-task-list-item/new-task-list-item";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";

export function TaskList({
  tasks,
  goalId,
  onTaskStatusChange,
  onTaskCountChange,
  setTasksLocal,
}: {
  tasks?: Task[] | DraftTask[];
  goalId?: string;
  onTaskStatusChange?: (oldStatus: Status, newStatus: Status) => void;
  onTaskCountChange?: (isDelete?: boolean) => void;
  setTasksLocal?: Dispatch<SetStateAction<Task[] | DraftTask[] | undefined>>;
}) {
  const [localTasks, setLocalTasks] = useState<
    Task[] | DraftTask[] | undefined
  >(tasks);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const { showToast, setIsSuccess } = useToast();
  const { draftGoal, setDraftGoal } = useGoalContext();
  const router = useRouter();

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDelete = async (id?: string) => {
    if (!id) return;

    const oldTasks = localTasks;
    onTaskCountChange && onTaskCountChange(true);
    setLocalTasks((prev) => prev?.filter((t) => (t as Task).id !== id));
    setTasksLocal?.((prev) => prev?.filter((t) => (t as Task).id !== id));
    try {
      await taskService.remove(id);
      router.refresh();
    } catch (err) {
      setIsSuccess(false);
      const error = err as ApiError;
      showToast(error.message);
      setLocalTasks(oldTasks);
      setTasksLocal?.(oldTasks);
      onTaskCountChange && onTaskCountChange(false);
    }
  };

  const handleAddNewTask = async (newTask: DraftTask) => {
    setIsAddingTask(false);

    if (goalId) {
      const optimisticId = `temp-${Date.now()}`;
      const optimisticTask = { ...newTask, id: optimisticId };

      const updatedTasks = [...(localTasks || []), optimisticTask];
      const oldTasks = localTasks;
      setLocalTasks(updatedTasks);
      setTasksLocal?.(updatedTasks);
      onTaskCountChange && onTaskCountChange(false);

      const formattedDeadline = (
        newTask.deadline instanceof Date
          ? newTask.deadline
          : new Date(newTask.deadline)
      )
        .toISOString()
        .split("T")[0];

      const newTaskData: CreateTaskRequestBody = {
        name: newTask.name,
        status: newTask.status,
        deadline: formattedDeadline as unknown as Date,
        goalId: goalId,
      };

      try {
        const createdTask = await taskService.create(newTaskData);
        setLocalTasks((prev) =>
          prev?.map((t) => ((t as Task).id === optimisticId ? createdTask : t)),
        );
        setTasksLocal?.((prev) =>
          prev?.map((t) => ((t as Task).id === optimisticId ? createdTask : t)),
        );
        router.refresh();
      } catch (err) {
        setIsSuccess(false);
        const error = err as ApiError;
        showToast(error.message);
        setLocalTasks(oldTasks);
        setTasksLocal?.(oldTasks);
        onTaskCountChange && onTaskCountChange(true);
      }
    } else {
      const maxIndex = localTasks?.length
        ? Math.max(...localTasks.map((t) => (t as DraftTask).index || 0))
        : 0;
      const draftTask = { ...newTask, index: maxIndex + 1 };

      const updatedTasks = [...(localTasks || []), draftTask];
      setLocalTasks(updatedTasks);
      onTaskCountChange && onTaskCountChange(false);

      if (draftGoal) {
        setDraftGoal({
          ...draftGoal,
          tasks: [...(draftGoal.tasks || []), draftTask],
        } as CreateGoalResponseBody);
      }
    }
  };

  return (
    <CardNoPadding p="5" isPrimary>
      <Flex direction="column" width="100%" height="100%" gap="3">
        <Flex width="100%" height="100%" justify="end">
          <CustomButton
            buttonType={ButtonType.Primary}
            onClick={() => setIsAddingTask(true)}
            size="1"
            data-testid={`add-task-button`}
          >
            Add Task
          </CustomButton>
        </Flex>
        {localTasks?.map((value, index) => {
          const isRealTask = "id" in value && value.id;
          const taskKey = isRealTask ? value.id : (value as DraftTask).index;
          return (
            <Flex key={taskKey} align="center" gap="1">
              <TaskListItem
                task={value}
                onTaskStatusChange={onTaskStatusChange}
                index={index}
                setTasksLocal={setTasksLocal}
              />
              <Trash2
                size={16}
                cursor="pointer"
                className={styles.overdue}
                onClick={() => {
                  if (isRealTask) {
                    handleDelete(value.id);
                  } else if ("index" in value) {
                    onTaskCountChange && onTaskCountChange(true);
                    setLocalTasks((prev) =>
                      prev?.filter((t: DraftTask) => t.index !== value.index),
                    );
                    if (draftGoal) {
                      setDraftGoal({
                        ...draftGoal,
                        tasks: draftGoal.tasks?.filter(
                          (t: DraftTask) => t.index !== value.index,
                        ),
                      } as CreateGoalResponseBody);
                    }
                  }
                }}
                data-testid={`delete-task-${index}-button`}
              />
            </Flex>
          );
        })}

        {isAddingTask && (
          <Flex align="center" gap="1">
            <NewTaskListItem
              onSave={handleAddNewTask}
              onCancel={() => setIsAddingTask(false)}
            />
          </Flex>
        )}
      </Flex>
    </CardNoPadding>
  );
}
