import { Header } from "@/app/components/header/header";
import { KanbanBoard } from "@/app/components/kanban-board/kanban-board";
import { DraftTask, MOCK_GOAL_RESPONSE_DATA } from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { Flex, ScrollArea } from "@radix-ui/themes";

const MOCK_TASKS: DraftTask[] = [
  {
    id: 1,
    name: "Learn useState and useEffect",
    status: Status.ToDo,
    deadline: new Date("2025-11-15"),
    goalId: 1,
    goalName:"Learn React in 3 months",
  },
  {
    id: 2,
    name: "Learn useContext and useReducer",
    status: Status.ToDo,
    deadline: new Date("2025-11-20"),
    goalId: 1,
    goalName:"Learn React in 3 months",
  },
  {
    id: 3,
    name: "Build a todo app",
    status: Status.ToDo,
    deadline: new Date("2025-12-01"),
    goalId: 1,
    goalName:"Learn React in 3 months",
  },
  {
    id: 4,
    name: "Deploy the app",
    status: Status.Completed,
    deadline: new Date("2025-12-15"),
    goalId: 1,
    goalName:"Project X",
  },
  {
    id: 5,
    name: "Write unit tests",
    status: Status.InProgress,
    deadline: new Date("2025-12-05"),
    goalId: 1,
    goalName:"Project X",
  },
];

export default async function AllTaskPage() {
  return (
    <Flex width="100%" justify="center" height="100%">
      <Flex
        width="100%"
        direction="column"
        pl="7"
        py="5"
        gap="2"
      >
        <Header
          text="All Tasks"
          subText="Use Kanban board to manage your tasks"
          textSize="7"
          subTextSize="2"
        />
        <ScrollArea
          size="1"
          type="hover"
          scrollbars="horizontal"
        >
          <KanbanBoard tasks={MOCK_TASKS} />
        </ScrollArea>
      </Flex>
    </Flex>
  );
}
