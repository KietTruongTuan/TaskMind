import { Flex } from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { TaskListItem } from "../task-list-item/task-list-item";
import { ApiError, DraftTask, Task, taskService } from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { Trash2 } from "lucide-react";
import styles from "./task-list.module.scss";
import { useEffect, useState } from "react";
import { useToast } from "@/app/contexts/toast-context/toast-context";

export function TaskList({
  tasks,
  onTaskStatusChange,
  onTaskCountChange,
}: {
  tasks: Task[] | DraftTask[];
  onTaskStatusChange?: (oldStatus: Status, newStatus: Status) => void;
  onTaskCountChange?: (isDelete?: boolean) => void;
}) {
  const [localTasks, setLocalTasks] = useState<Task[] | DraftTask[]>(tasks);
  const { showToast, setIsSuccess } = useToast();

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const handleDelete = async (id?: string) => {
    if (!id) return;

    const oldTasks = localTasks;
    onTaskCountChange && onTaskCountChange(true);
    setLocalTasks((prev) => prev.filter((t) => t.id !== id));
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
        {localTasks?.map((value, index) => (
          <Flex key={value.id ?? index} align="center" gap="1">
            <TaskListItem
              task={value}
              onTaskStatusChange={onTaskStatusChange}
            />
            <Trash2
              size={16}
              cursor="pointer"
              className={styles.overdue}
              onClick={() => handleDelete(value.id)}
              data-testid={`delete-task-${index}-button`}
            />
          </Flex>
        ))}
      </Flex>
    </CardNoPadding>
  );
}
