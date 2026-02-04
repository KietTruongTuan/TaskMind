import { Flex } from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { TaskListItem } from "../task-list-item/task-list-item";
import { DraftTask, Task } from "@/app/constants";

export function TaskList({ tasks }: { tasks: Task[] | DraftTask[] }) {
  return (
    <CardNoPadding p="5" isPrimary>
      <Flex direction="column" width="100%" height="100%" gap="3">
        {tasks?.map((value, index) => (
          <TaskListItem
            name={value.name}
            status={value.status}
            deadline={new Date(value.deadline)}
            key={index}
          />
        ))}
      </Flex>
    </CardNoPadding>
  );
}
