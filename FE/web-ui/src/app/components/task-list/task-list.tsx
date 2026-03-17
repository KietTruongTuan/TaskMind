import { Flex } from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { TaskListItem } from "../task-list-item/task-list-item";
import {
  ApiError,
  CreateGoalResponseBody,
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

export function TaskList({
  tasks,
  onTaskStatusChange,
  onTaskCountChange,
}: {
  tasks?: Task[] | DraftTask[];
  onTaskStatusChange?: (oldStatus: Status, newStatus: Status) => void;
  onTaskCountChange?: (isDelete?: boolean) => void;
}) {
  const [localTasks, setLocalTasks] = useState<
    Task[] | DraftTask[] | undefined
  >(tasks);
  const { showToast, setIsSuccess } = useToast();
  const { draftGoal, setDraftGoal } = useGoalContext();
  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDelete = async (id?: string) => {
    if (!id) return;

    const oldTasks = localTasks;
    onTaskCountChange && onTaskCountChange(true);
    setLocalTasks((prev) => prev?.filter((t) => t.id !== id));
    try {
      await taskService.remove(id);
    } catch (err) {
      setIsSuccess(false);
      const error = err as ApiError;
      showToast(error.message);
      setLocalTasks(oldTasks);
      onTaskCountChange && onTaskCountChange(false);
    }
  };

  return (
    <CardNoPadding p="5" isPrimary>
      <Flex direction="column" width="100%" height="100%" gap="3">
        {localTasks?.map((value, index) => {
          const isRealTask = "id" in value && value.id;
          const taskKey = isRealTask ? value.id : (value as DraftTask).index;
          return (
            <Flex key={taskKey} align="center" gap="1">
              <TaskListItem
                task={value}
                onTaskStatusChange={onTaskStatusChange}
                index={index}
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
                    setDraftGoal({
                      ...draftGoal,
                      tasks: draftGoal?.tasks?.filter(
                        (t: DraftTask) => t.index !== value.index,
                      ),
                    } as CreateGoalResponseBody);
                  }
                }}
                data-testid={`delete-task-${index}-button`}
              />
            </Flex>
          );
        })}
      </Flex>
    </CardNoPadding>
  );
}
