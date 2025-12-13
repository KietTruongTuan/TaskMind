import { Flex } from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { Task } from "@/app/constants/task.constants";
import { TaskListItem } from "../task-list-item/task-list-item";

export function TaskList({tasks}: {tasks:Task[]}) {
  return (
    <CardNoPadding p="5" isPrimary>
      <Flex direction="column" width="100%" height="100%" gap="3">
        {tasks?.map((value, index) => (
          <TaskListItem
            name={value.name}
            status={value.status}
            deadline={value.deadline}
            key={index}
          />
        ))}
      </Flex>
    </CardNoPadding>
  );
}
