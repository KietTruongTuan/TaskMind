"use client";
import { useCallback, useMemo, useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Flex } from "@radix-ui/themes";
import { Status } from "@/app/enum/status.enum";
import { DraftTask } from "@/app/constants";
import { KanbanColumn } from "../kanban-column/kanban-column";
import styles from "./kanban-board.module.scss";

export interface KanbanBoardProps {
  tasks: DraftTask[];
  onTaskStatusChange?: (taskId: number | undefined, newStatus: Status) => void;
  onTasksReorder?: (updatedTasks: DraftTask[]) => void;
  isLoading?: boolean;
}

const STATUS_ORDER = [
  Status.ToDo,
  Status.InProgress,
  Status.OnHold,
  Status.Completed,
  Status.Cancel,
  Status.Overdue,
];

export function KanbanBoard({
  tasks,
  onTaskStatusChange,
  onTasksReorder,
  isLoading = false,
}: KanbanBoardProps) {
  const [localTasks, setLocalTasks] = useState<DraftTask[]>(tasks);

  const tasksByStatus = useMemo(() => {
    const grouped: Record<Status, DraftTask[]> = {
      [Status.ToDo]: [],
      [Status.InProgress]: [],
      [Status.OnHold]: [],
      [Status.Completed]: [],
      [Status.Cancel]: [],
      [Status.Overdue]: [],
    };

    localTasks.forEach((task) => {
      grouped[task.status].push(task);
    });

    return grouped;
  }, [localTasks]);

  const handleDragOver = useCallback(
    (event: DragOverEvent) => {
      const { active, over } = event;

      if (!over) return;

      const activeTask = localTasks.find((t) => t.id === active.id);
      const targetStatus = over.data?.current?.status as Status;

      if (!activeTask || !targetStatus) return;

      if (activeTask.status === targetStatus) return;

      setLocalTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) =>
          task.id === activeTask.id ? { ...task, status: targetStatus } : task,
        );
        return updatedTasks;
      });

      onTaskStatusChange?.(activeTask.id, targetStatus);
    },
    [localTasks, onTaskStatusChange],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const activeTask = localTasks.find((t) => t.id === active.id);
      const overTask = localTasks.find((t) => t.id === over.id);

      if (!activeTask || !overTask) return;

      // If reordering within the same status
      if (activeTask.status === overTask.status) {
        const statusTasks = tasksByStatus[activeTask.status];
        const oldIndex = statusTasks.findIndex((t) => t.id === active.id);
        const newIndex = statusTasks.findIndex((t) => t.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          const reorderedStatusTasks = arrayMove(
            statusTasks,
            oldIndex,
            newIndex,
          );
          const updatedTasks = localTasks.map((task) => {
            const reorderedTask = reorderedStatusTasks.find(
              (t) => t.id === task.id,
            );
            return reorderedTask || task;
          });
          setLocalTasks(updatedTasks);
          onTasksReorder?.(updatedTasks);
        }
      }
    },
    [localTasks, tasksByStatus, onTasksReorder],
  );

  return (
    <DndContext
      collisionDetection={closestCorners}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <Flex gap="4" className={styles.kanbanBoard} width="100%">
        {STATUS_ORDER.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            isLoading={isLoading}
          />
        ))}
      </Flex>
    </DndContext>
  );
}
