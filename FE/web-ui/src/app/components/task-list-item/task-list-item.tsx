import { Flex, Text } from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { Status } from "@/app/enum/status.enum";
import { StatusDropDown } from "../status-dropdown/status-dropdown";
import { Calendar } from "lucide-react";
import styles from "./task-list-item.module.scss";

interface TaskListItemProps {
  name: string;
  status: Status;
  deadline: Date;
}

export function TaskListItem({ name, status, deadline }: TaskListItemProps) {
  const isCompleted = status === Status.Completed;
  return (
    <CardNoPadding py="2" px="3">
      <Flex width="100%" height="100%" justify="between" align="center">
        <Text
          style={{
            textDecoration: isCompleted ? "line-through" : "",
          }}
          className={isCompleted ? "" : styles.subText}
        >
          {name}
        </Text>
        <Flex gap="3" align="center">
          <StatusDropDown status={status} />
          <Flex gap="1" className={styles.subText}>
            <Calendar size={14} />
            <Text size="1">{deadline.toISOString().split("T")[0]}</Text>
          </Flex>
        </Flex>
      </Flex>
    </CardNoPadding>
  );
}
