import { Flex, Grid } from "@radix-ui/themes";
import { StatusCardList } from "./components/status-card-list/status-card-list";
import {
  GoalCardPropsData,
  RecentGoalList,
} from "./components/recent-goal-list/recent-goal-list";
import { GoalCompletedCard } from "@/app/components/goal-completed-card/goal-completed-card";
import { Crown } from "lucide-react";
import { GreetingText } from "@/app/components/greeting-text/greeting-text";
import { Status } from "@/app/enum/status.enum";
import { GoalProvider } from "@/app/contexts/goal-context/goal-context";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import { StatusDisplay } from "@/app/constants";
import { PieChartData } from "./components/pie-chart-card/pie-chart-card";
import { InteractiveGroup } from "./components/interactive-group/interactive-group";

export default async function DashboardPage() {
  const { goalService, taskService } = await useServerSideService();

  const goalListData = await goalService.getAll();
  const { goals, ...goalStats } = goalListData;

  const taskListData = await taskService.getAll();
  const { tasks, ...taskStats } = taskListData;

  const taskProductivityData = await taskService.getProductivity();

  const recentCompletedGoals: GoalCardPropsData[] = goals
    .filter((goal) => goal.status === Status.Completed)
    .sort((a, b) => {
      const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
      const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  const chartData: PieChartData[] = [
    {
      id: Status.ToDo,
      value: taskStats.toDoCount,
      label: StatusDisplay[Status.ToDo].title,
      color: "var(--status-to-do)",
    },
    {
      id: Status.InProgress,
      value: taskStats.inProgressCount,
      label: StatusDisplay[Status.InProgress].title,
      color: "var(--status-in-progress)",
    },
    {
      id: Status.Completed,
      value: taskStats.completedCount,
      label: StatusDisplay[Status.Completed].title,
      color: "var(--status-completed)",
    },
    {
      id: Status.OnHold,
      value: taskStats.onHoldCount,
      label: StatusDisplay[Status.OnHold].title,
      color: "var(--status-on-hold)",
    },
    {
      id: Status.Cancelled,
      value: taskStats.cancelledCount,
      label: StatusDisplay[Status.Cancelled].title,
      color: "var(--status-cancel)",
    },
    {
      id: Status.Overdue,
      value: taskStats.overdueCount,
      label: StatusDisplay[Status.Overdue].title,
      color: "var(--status-overdue)",
    },
  ];

  return (
    <GoalProvider>
      <Flex width="100%" justify="center" height="100%">
        <Flex width="100%" direction="column" py="5" gap="5">
          <GreetingText />
          <Grid rows="1fr auto auto" gap="5">
            <StatusCardList
              totalGoal={goalStats.totalCount}
              completedGoal={goalStats.completedCount}
              inProgressGoal={goalStats.inProgressCount}
              overdueGoal={goalStats.overdueCount}
            />
            <InteractiveGroup
              goals={goals}
              tasks={tasks}
              chartData={chartData}
              taskProductivityData={taskProductivityData}
            />
            <RecentGoalList
              header="Recent Achievements"
              subHeader="The goals you have completed"
              nullMessage="No completed goals available"
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
