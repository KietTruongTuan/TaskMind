import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Flex, Heading, Text } from "@radix-ui/themes";
import { Status } from "@/app/enum/status.enum";
import { DraftTask } from "@/app/constants";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { KanbanTask } from "../kanban-task/kanban-task";
import styles from "./kanban-column.module.scss";
import { useMemo } from "react";

interface KanbanColumnProps {
  status: Status;
  tasks: DraftTask[];
  isLoading?: boolean;
}

const STATUS_DISPLAY: Record<Status, { label: string; color: string }> = {
  [Status.ToDo]: { label: "To Do", color: "--text-secondary" },
  [Status.InProgress]: { label: "In Progress", color: "--accent-blue" },
  [Status.OnHold]: { label: "On Hold", color: "--accent-orange" },
  [Status.Completed]: { label: "Completed", color: "--accent-green" },
  [Status.Cancel]: { label: "Cancelled", color: "--accent-red" },
  [Status.Overdue]: { label: "Overdue", color: "--accent-red" },
};

export function KanbanColumn({
  status,
  tasks,
  isLoading = false,
}: KanbanColumnProps) {
  const { setNodeRef } = useDroppable({
    id: `column-${status}`,
    data: { status },
  });

  const taskIds = useMemo(() => tasks.map((task) => task.id || 0), [tasks]);

  const displayInfo = STATUS_DISPLAY[status];

  return (
    <div
      ref={setNodeRef}
      className={styles.column}
      style={{ flex: "1 1 300px" }}
    >
      <CardNoPadding p="4" isPrimary={false}>
        <Flex
          direction="column"
          width="100%"
          height="100%"
          gap="3"
          className={styles.columnContent}
        >
          <Flex justify="between" align="center" width="100%" gap="2">
            <Heading size="4" weight="medium">
              {displayInfo.label}
            </Heading>
            <Text
              size="2"
              style={{
                color: `var(${displayInfo.color})`,
                fontWeight: 600,
              }}
            >
              {tasks.length}
            </Text>
          </Flex>

          <SortableContext
            items={taskIds}
            strategy={verticalListSortingStrategy}
          >
            <Flex
              direction="column"
              width="100%"
              gap="2"
              className={styles.tasksList}
            >
              {!isLoading && tasks.length === 0 ? (
                <Text
                  size="2"
                  style={{
                    color: "var(--text-secondary)",
                    textAlign: "center",
                    padding: "1rem",
                  }}
                >
                  No tasks
                </Text>
              ) : (
                tasks.map((task) => <KanbanTask key={task.id} task={task} />)
              )}
            </Flex>
          </SortableContext>
        </Flex>
      </CardNoPadding>
    </div>
  );
}
