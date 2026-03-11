import { Flex, Grid } from "@radix-ui/themes";
import { StatusCardList } from "./components/status-card-list/status-card-list";
import {
  GoalCardPropsData,
  RecentGoalList,
} from "./components/recent-goal-list/recent-goal-list";
import { GoalCard } from "@/app/components/goal-card/goal-card";
import { GoalCompletedCard } from "@/app/components/goal-completed-card/goal-completed-card";
import { Crown, TrendingUp } from "lucide-react";
import { GreetingText } from "@/app/components/greeting-text/greeting-text";
import { Status } from "@/app/enum/status.enum";

export default function DashboardPage() {
  const recentGoals: GoalCardPropsData[] = [
    {
      name: "Learn TypeScript",
      status: Status.InProgress,
      tag: ["Study"],
      deadline: new Date("2025-12-31"),
      completedCount: 10,
      taskCount: 20,
    },
    {
      name: "ABC Project",
      status: Status.InProgress,
      tag: ["Work"],
      deadline: new Date("2025-10-15"),
      completedCount: 10,
      taskCount: 20,
    },
    {
      name: "Six-pack abs",
      status: Status.InProgress,
      tag: ["Health", "Gym"],
      deadline: new Date("2025-12-31"),
      completedCount: 10,
      taskCount: 20,
    },
    {
      name: "Visit Indonesia",
      status: Status.InProgress,
      tag: ["Travel"],
      deadline: new Date("2025-11-01"),
      completedCount: 10,
      taskCount: 20,
    },
  ];

  const recentCompletedGoals: GoalCardPropsData[] = [
    {
      name: "Learn TypeScript",
      status: Status.InProgress,
      tag: ["Study"],
      deadline: new Date("2025-12-31"),
      completedCount: 10,
      taskCount: 20,
      completedDate: new Date("2025-09-02"),
    },
    {
      name: "ABC Project",
      status: Status.InProgress,
      tag: ["Work"],
      deadline: new Date("2025-10-15"),
      completedCount: 10,
      taskCount: 20,
      completedDate: new Date("2025-08-02"),
    },
    {
      name: "ABC Project",
      status: Status.InProgress,
      tag: ["Work"],
      deadline: new Date("2025-09-06"),
      completedCount: 10,
      taskCount: 20,
      completedDate: new Date("2025-09-06"),
    },
  ];
  const tasksDueSoon: GoalCardPropsData[] = [];

  return (
    <Flex width="100%" justify="center" height="100%">
      <Flex
        width={{ initial: "90%", xs: "85%" }}
        direction="column"
        py="5"
        gap="5"
      >
        <GreetingText />
        <Grid rows="1fr auto auto" gap="5">
          <StatusCardList />
          <Grid columns={{ initial: "1", md: "2fr 1fr" }} gap="5">
            <RecentGoalList
              header="Recent Goals"
              subHeader="Track the progress of current goals"
              icon={TrendingUp}
              data={recentGoals}
              cardTypeComponent={GoalCard}
            />
            <RecentGoalList
              header="Due soon (will do when we have the design of tasks checklist)"
              subHeader="Tasks Nearing Deadline"
              data={tasksDueSoon}
              cardTypeComponent={GoalCard}
            />
          </Grid>
          <RecentGoalList
            header="Recent Achievements"
            subHeader="The goals you have completed"
            icon={Crown}
            data={recentCompletedGoals}
            cardTypeComponent={GoalCompletedCard}
            isFlexible
          />
        </Grid>
      </Flex>
    </Flex>
  );
}
