import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Flex, Text } from "@radix-ui/themes";
import { Calendar, GripVertical } from "lucide-react";
import { Status } from "@/app/enum/status.enum";
import { DraftTask } from "@/app/constants";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import styles from "./kanban-task.module.scss";

interface KanbanTaskProps {
  task: DraftTask;
}

export function KanbanTask({ task }: KanbanTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id || 0,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 1000 : 0,
  };

  const isCompleted = task.status === Status.Completed;

  return (
    <div ref={setNodeRef} style={style}>
      <CardNoPadding py="3" px="3" className={styles.taskCard}>
        <Flex width="100%" gap="2" align="start">
          <div className={styles.dragHandle} {...attributes} {...listeners}>
            <GripVertical size={16} />
          </div>
          <Flex
            direction="column"
            width="100%"
            gap="2"
            className={styles.taskContent}
          >
            <Text
              size="2"
              weight="medium"
              className={styles.taskName}
              style={{
                textDecoration: isCompleted ? "line-through" : "",
                color: isCompleted ? "var(--text-secondary)" : "inherit",
              }}
            >
              {task.name}
            </Text>
            {task.deadline && (
              <Flex gap="1" align="center" className={styles.deadline}>
                <Calendar size={14} />
                <Text size="1" className={styles.deadlineText}>
                  {new Date(task.deadline).toISOString().split("T")[0]}
                </Text>
              </Flex>
            )}
          </Flex>
        </Flex>
      </CardNoPadding>
    </div>
  );
}
