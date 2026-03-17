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
import { GoalProvider } from "@/app/contexts/goal-context/goal-context";

export default function DashboardPage() {
  const recentGoals: GoalCardPropsData[] = [
    {
      name: "Learn TypeScript",
      status: Status.InProgress,
      description:
        "Master TypeScript to enhance your JavaScript skills and build robust applications.",
      tag: ["Study"],
      deadline: new Date("2025-12-31"),
      completedCount: 10,
      taskCount: 20,
    },
    {
      name: "ABC Project",
      status: Status.InProgress,
      description:
        "Complete the ABC project to deliver a high-quality product that meets client requirements and deadlines.",
      tag: ["Work"],
      deadline: new Date("2025-10-15"),
      completedCount: 10,
      taskCount: 20,
    },
    {
      name: "Six-pack abs",
      status: Status.InProgress,
      description:
        "Achieve six-pack abs through a combination of regular exercise, a healthy diet, and consistent effort to improve physical fitness.",
      tag: ["Health", "Gym"],
      deadline: new Date("2025-12-31"),
      completedCount: 10,
      taskCount: 20,
    },
    {
      name: "Visit Indonesia",
      status: Status.InProgress,
      description:
        "Explore the diverse culture, stunning landscapes, and vibrant cities of Indonesia for an unforgettable travel experience.",
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
      description:
        "Master TypeScript to enhance your JavaScript skills and build robust applications.",
      tag: ["Study"],
      deadline: new Date("2025-12-31"),
      completedCount: 10,
      taskCount: 20,
      completedDate: new Date("2025-09-02"),
    },
    {
      name: "ABC Project",
      status: Status.InProgress,
      description:
        "Complete the ABC project to deliver a high-quality product that meets client requirements and deadlines.",
      tag: ["Work"],
      deadline: new Date("2025-10-15"),
      completedCount: 10,
      taskCount: 20,
      completedDate: new Date("2025-08-02"),
    },
    {
      name: "ABC Project",
      description:
        "Complete the ABC project to deliver a high-quality product that meets client requirements and deadlines.",
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
    <GoalProvider>
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
    </GoalProvider>
  );
}
