"use client";
import {
  Kanban,
  KanbanColumn,
  KanbanColumnHeader,
  KanbanColumnBody,
  KanbanCard,
  KanbanDragOverlay,
  OnCardDragEndHandler,
} from "@saas-ui-pro/kanban";
import {
  DraftTask,
  DraftTaskRequestBody,
  StatusDisplay,
  Task,
  taskService,
} from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { KanbanItem } from "../kanban-item/kanban-item";
import {
  Badge,
  Box,
  Flex,
  Inset,
  Separator,
  Text,
  Theme,
} from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import styles from "./kanban-board.module.scss";
import { useCallback, useState } from "react";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { ThemeProvider } from "@/app/contexts/theme-context/theme-context";

export function KanbanBoard({ tasks: initialTasks }: { tasks?: Task[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [key, setKey] = useState(0);
  const { showToast, setIsSuccess } = useToast();
  const kanbanItems = tasks
    ? Object.values(Status).reduce(
        (acc, status) => {
          acc[status] = tasks
            .filter((task) => task.status === status)
            .map((task) => String(task.id));
          return acc;
        },
        {} as Record<Status, string[]>,
      )
    : {};

  const onCardDragEnd: OnCardDragEndHandler = useCallback(
    async (args) => {
      const { to, items } = args;
      const newStatus = to.columnId as Status;
      const taskIds = items[newStatus] || [];
      const taskId = String(taskIds[to.index]);

      const task = tasks?.find((t) => String(t.id) === taskId);

      if (task && task.status !== newStatus) {
        const oldStatus = task.status;

        setTasks((prevTasks) =>
          prevTasks?.map((t) =>
            String(t.id) === taskId ? { ...t, status: newStatus } : t,
          ),
        );
        try {
          await taskService.update(taskId, {
            status: newStatus,
          } as DraftTaskRequestBody);
        } catch (error) {
          setTasks((prevTasks) =>
            prevTasks?.map((t) =>
              String(t.id) === taskId ? { ...t, status: oldStatus } : t,
            ),
          );

          setKey((k) => k + 1);
          setIsSuccess(false);
          showToast("Failed to update task status");
        }
      }
    },
    [tasks],
  );

  return (
    <Kanban key={key} defaultItems={kanbanItems} onCardDragEnd={onCardDragEnd}>
      {(kanbanState) => (
        <>
          <Flex gap="4" align="start" mb="4">
            {kanbanState.columns.map((columnId) => (
              <Flex key={columnId} className={styles.columnWrapper}>
                <CardNoPadding key={columnId} p="2">
                  <KanbanColumn id={columnId}>
                    <Flex direction="column" gap="3">
                      <KanbanColumnHeader>
                        <Flex align="center" gap="2">
                          <Box
                            width="12px"
                            height="12px"
                            className={`${styles.statusDot} ${styles[columnId as Status]}`}
                          />
                          <Text size="3" weight="medium">
                            {StatusDisplay[columnId as Status]?.title}
                          </Text>
                        </Flex>

                        <Flex
                          px="2"
                          justify="center"
                          align="center"
                          className={styles.badgeCount}
                        >
                          <Text size="1" weight="medium">
                            {kanbanState.items[columnId]?.length}
                          </Text>
                        </Flex>
                      </KanbanColumnHeader>
                      <Inset mx="-4">
                        <Separator size="4" />
                      </Inset>

                      <KanbanColumnBody>
                        {kanbanState.items[columnId]?.map((itemId) => {
                          const task: Task | undefined = tasks?.find(
                            (t) => String(t.id) === itemId,
                          );
                          return task ? (
                            <KanbanCard key={itemId} id={itemId} cursor="grab">
                              <KanbanItem task={task} />
                            </KanbanCard>
                          ) : null;
                        })}
                      </KanbanColumnBody>
                    </Flex>
                  </KanbanColumn>
                </CardNoPadding>
              </Flex>
            ))}
          </Flex>

          <KanbanDragOverlay>
            {kanbanState.activeId
              ? (() => {
                  const task = tasks?.find(
                    (t) => String(t.id) === kanbanState.activeId,
                  );
                  return task ? (
                    <ThemeProvider>
                      <KanbanCard id={kanbanState.activeId}>
                        <KanbanItem task={task} />
                      </KanbanCard>
                    </ThemeProvider>
                  ) : null;
                })()
              : null}
          </KanbanDragOverlay>
        </>
      )}
    </Kanban>
  );
}
