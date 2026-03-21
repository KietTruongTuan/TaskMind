import { DraftTask } from "@/app/constants";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { Flex, Text } from "@radix-ui/themes";
import { StatusDropDown } from "../status-dropdown/status-dropdown";
import { Calendar, Target } from "lucide-react";
import styles from "./kanban-item.module.scss";
export function KanbanItem({ task }: { task: DraftTask }) {
  return (
    <CardNoPadding py="3" px="4">
      <Flex width="100%" height="100%" direction="column" gap="4">
        <Text size="2" weight="regular">
          {task.name}
        </Text>
        <Flex direction="column" gap="3" justify="center" className={styles.subText}>
          <Flex>
            <StatusDropDown status={task.status} />
          </Flex>
          <Flex gap="1" align="start">
            <Calendar size={14} />
            <Text size="1">{task.deadline.toISOString().split("T")[0]}</Text>
          </Flex>
          <Flex gap="1" align="start">
            <Target size={14} />
            <Text size="1">{task.goalName}</Text>
          </Flex>
        </Flex>
      </Flex>
    </CardNoPadding>
  );
}
