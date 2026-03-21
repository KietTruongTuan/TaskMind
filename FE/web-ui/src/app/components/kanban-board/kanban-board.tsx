"use client";
import {
  Kanban,
  KanbanColumn,
  KanbanColumnHeader,
  KanbanColumnBody,
  KanbanCard,
  KanbanDragOverlay,
} from "@saas-ui-pro/kanban";
import { DraftTask, StatusDisplay } from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { KanbanItem } from "../kanban-item/kanban-item";
import { Badge, Box, Flex, Inset, Separator, Text } from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import styles from "./kanban-board.module.scss";
export function KanbanBoard({ tasks }: { tasks?: DraftTask[] }) {
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

  return !tasks || tasks.length === 0 ? (
    <Box>No tasks</Box>
  ) : (
    <Kanban defaultItems={kanbanItems}>
      {(kanbanState) => (
        <>
          <Flex gap="4" align="start" mb="4">
            {kanbanState.columns.map((columnId) => (
              <Flex key={columnId} className={styles.columnWrapper}>
                <CardNoPadding key={columnId} p="2">
                  <KanbanColumn id={columnId}>
                    <Flex direction="column" gap="3">
                      <KanbanColumnHeader>
                        <Flex>
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
                        {kanbanState.items[columnId]?.map((itemId) => {                          const task: DraftTask | undefined = tasks.find(
                            (t) => String(t.id) === itemId,
                          );
                          return task ? (
                            <KanbanCard key={itemId} id={itemId}>
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
                    <KanbanCard id={kanbanState.activeId}>
                      <KanbanItem task={task} />
                    </KanbanCard>
                  ) : null;
                })()
              : null}
          </KanbanDragOverlay>
        </>
      )}
    </Kanban>
  );
}
