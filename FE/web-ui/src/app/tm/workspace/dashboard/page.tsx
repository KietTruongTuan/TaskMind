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
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";

export default async function DashboardPage() {
  const { goalService } = await useServerSideService();
  const goalListData = await goalService.getAll();
  console.log(goalListData);
  const recentGoals: GoalCardPropsData[] = goalListData
    .filter((goal) => goal.status === Status.InProgress)
    .sort(
      (a, b) =>
        new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
    .slice(0, 4);

  const recentCompletedGoals: GoalCardPropsData[] = goalListData
    .filter((goal) => goal.status === Status.Completed)
    .sort((a, b) => {
      const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
      const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

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
