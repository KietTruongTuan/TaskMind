import { DraftTask } from "@/app/constants";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { Flex, Text } from "@radix-ui/themes";
import { StatusDropDown } from "../status-dropdown/status-dropdown";
import { Calendar, Target } from "lucide-react";
import styles from "./kanban-item.module.scss";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import { buildUrl } from "@/app/tm/utils";
import { WebUrl } from "@/app/enum/web-url.enum";

export function KanbanItem({
  task,
  isLocal,
}: {
  task: DraftTask;
  isLocal?: boolean;
}) {
  const { route } = useRouteLoadingContext();
  return (
    <CardNoPadding
      py="3"
      px="4"
      data-testid={`kanban-item-${task.id ?? task.index}`}
      className={styles.kanbanItem}
    >
      <Flex width="100%" height="100%" direction="column" gap="4">
        <Text size="2" weight="regular">
          {task.name}
        </Text>
        <Flex
          direction="column"
          gap="2"
          justify="center"
          className={styles.subText}
        >
          <Flex justify="between">
            <Flex>
              <StatusDropDown status={task.status} />
            </Flex>
            <Flex gap="1" align="start">
              <Calendar size={14} />
              <Text size="1">
                {new Date(task.deadline).toISOString().split("T")[0]}
              </Text>
            </Flex>
          </Flex>

          {!isLocal && (
            <Flex
              gap="1"
              align="start"
              className={styles.buttonText}
              onClick={() =>
                route(buildUrl(WebUrl.GoalDetail, task.goalId, undefined))
              }
            >
              <Target size={14} />
              <Text size="1">{task.goalName}</Text>
            </Flex>
          )}
        </Flex>
      </Flex>
    </CardNoPadding>
  );
}
