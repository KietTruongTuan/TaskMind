import { GoalSearchParams } from "@/app/enum/search-params.enum";
import { WebUrl } from "@/app/enum/web-url.enum";
import { buildUrl } from "@/app/tm/utils";
import { Box, Flex, ScrollArea } from "@radix-ui/themes";
import { GoalList } from "./components/goal-list/goal-list";
import { GoalListItemResponseBody } from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { Header } from "@/app/components/header/header";

export default async function MyGoalPage({
  searchParams,
}: {
  searchParams: Promise<Record<GoalSearchParams, string | null | undefined>>;
}) {
  const goalList: GoalListItemResponseBody[] = [
    {
      id: "1",
      name: "Learn React",
      description: "Understand the basics of React.js",
      status: Status.InProgress,
      deadline: new Date("2024-12-31"),
      tag: ["learning", "frontend"],
      completeCount: 3,
      taskCount: 10,
    },
    {
      id: "2",
      name: "Build a Portfolio Website",
      description:
        "To create a truly effective personal portfolio, you must move beyond a simple list of links and instead treat it as a comprehensive narrative of your professional evolution.",
      status: Status.ToDo,
      deadline: new Date("2025-01-15"),
      tag: ["web development", "personal"],
      completeCount: 0,
      taskCount: 5,
    },
    {
      id: "3",
      name: "Build a Portfolio Website",
      description:
        "To create a truly effective personal portfolio, you must move beyond a simple list of links and instead treat it as a comprehensive narrative of your professional evolution.",
      status: Status.ToDo,
      deadline: new Date("2025-01-15"),
      tag: ["web development", "personal"],
      completeCount: 0,
      taskCount: 5,
    },
    {
      id: "4",
      name: "Build a Portfolio Website",
      description:
        "To create a truly effective personal portfolio, you must move beyond a simple list of links and instead treat it as a comprehensive narrative of your professional evolution.",
      status: Status.ToDo,
      deadline: new Date("2025-01-15"),
      tag: ["web development", "personal"],
      completeCount: 0,
      taskCount: 5,
    },

    {
      id: "5",
      name: "Build a Portfolio Website",
      description:
        "To create a truly effective personal portfolio, you must move beyond a simple list of links and instead treat it as a comprehensive narrative of your professional evolution.",
      status: Status.ToDo,
      deadline: new Date("2025-01-15"),
      tag: ["web development", "personal"],
      completeCount: 0,
      taskCount: 5,
    },
    {
      id: "6",
      name: "Build a Portfolio Website",
      description:
        "To create a truly effective personal portfolio, you must move beyond a simple list of links and instead treat it as a comprehensive narrative of your professional evolution.",
      status: Status.ToDo,
      deadline: new Date("2025-01-15"),
      tag: ["web development", "personal"],
      completeCount: 0,
      taskCount: 5,
    },
    {
      id: "7",
      name: "Build a Portfolio Website",
      description:
        "To create a truly effective personal portfolio, you must move beyond a simple list of links and instead treat it as a comprehensive narrative of your professional evolution.",
      status: Status.ToDo,
      deadline: new Date("2025-01-15"),
      tag: ["web development", "personal"],
      completeCount: 0,
      taskCount: 5,
    },
    {
      id: "8",
      name: "Build a Portfolio Website",
      description:
        "To create a truly effective personal portfolio, you must move beyond a simple list of links and instead treat it as a comprehensive narrative of your professional evolution.",
      status: Status.ToDo,
      deadline: new Date("2025-01-15"),
      tag: ["web development", "personal"],
      completeCount: 0,
      taskCount: 5,
    },
    {
      id: "9",
      name: "Build a Portfolio Website",
      description:
        "To create a truly effective personal portfolio, you must move beyond a simple list of links and instead treat it as a comprehensive narrative of your professional evolution.",
      status: Status.ToDo,
      deadline: new Date("2025-01-15"),
      tag: ["web development", "personal"],
      completeCount: 0,
      taskCount: 5,
    },
  ];
  const params = await searchParams;
  return (
    <Flex width="100%" justify="center" height="92vh">
      <Flex width="100%" direction="column" py="5" px="7" gap="5">
        <Box>
          <Header
            text="My Goals"
            subText="Track and manage all your goals"
            textSize="7"
            subTextSize="2"
          />
        </Box>

        <ScrollArea type="auto" scrollbars="vertical">
          <GoalList goalList={goalList} />
        </ScrollArea>
      </Flex>
    </Flex>
  );
}
