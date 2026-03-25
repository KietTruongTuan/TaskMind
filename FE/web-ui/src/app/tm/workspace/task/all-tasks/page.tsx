import { Header } from "@/app/components/header/header";
import { KanbanBoard } from "@/app/components/kanban-board/kanban-board";
import { MOCK_GOAL_RESPONSE_DATA } from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { Flex } from "@radix-ui/themes";

const MOCK_TASKS = [
  {
    id: 1,
    name: "Learn useState and useEffect",
    status: Status.ToDo,
    deadline: new Date("2025-11-15"),
  },
  {
    id: 2,
    name: "Learn useContext and useReducer",
    status: Status.ToDo,
    deadline: new Date("2025-11-20"),
  },
  {
    id: 3,
    name: "Build a todo app",
    status: Status.InProgress,
    deadline: new Date("2025-12-01"),
  },
  {
    id: 4,
    name: "Deploy the app",
    status: Status.Completed,
    deadline: new Date("2025-12-15"),
  },
  {
    id: 5,
    name: "Write unit tests",
    status: Status.InProgress,
    deadline: new Date("2025-12-05"),
  },
];

export default async function AllTaskPage() {
  return (
    <Flex width="100%" justify="center" height="100%">
      <Flex
        width={{ initial: "90%", xs: "85%" }}
        direction="column"
        py="5"
        gap="2"
      >
        <Header
          text="All Tasks"
          subText="Use Kanban board to manage your tasks"
          textSize="7"
          subTextSize="2"
        />
        <KanbanBoard tasks={MOCK_TASKS} />
      </Flex>
    </Flex>
  );
}
