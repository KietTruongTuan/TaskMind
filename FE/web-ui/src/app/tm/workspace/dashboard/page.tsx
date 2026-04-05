import { Box, Flex, Grid } from "@radix-ui/themes";
import { StatusCardList } from "./components/status-card-list/status-card-list";
import {
  GoalCardPropsData,
  RecentGoalList,
} from "./components/recent-goal-list/recent-goal-list";
import { GoalCard } from "@/app/components/goal-card/goal-card";
import { GoalCompletedCard } from "@/app/components/goal-completed-card/goal-completed-card";
import { Clock, Crown, TrendingUp } from "lucide-react";
import { GreetingText } from "@/app/components/greeting-text/greeting-text";
import { Status } from "@/app/enum/status.enum";
import { GoalProvider } from "@/app/contexts/goal-context/goal-context";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import { KanbanItem } from "@/app/components/kanban-item/kanban-item";
import { StatusDisplay, Task } from "@/app/constants";
import {
  PieChartCard,
  PieChartData,
} from "./components/pie-chart-card/pie-chart-card";
import { ContributionGraph } from "@/app/tm/workspace/dashboard/components/contribution-graph/contribution-graph";

export default async function DashboardPage() {
  const { goalService, taskService } = await useServerSideService();
  
  const goalListData = await goalService.getAll();
  const { goals, ...goalStats } = goalListData;

  const taskListData = await taskService.getAll();
  const { tasks, ...taskStats } = taskListData;

  const recentGoals: GoalCardPropsData[] = goals
    .filter((goal) => goal.status === Status.InProgress)
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
    .slice(0, 4);

  const recentCompletedGoals: GoalCardPropsData[] = goals
    .filter((goal) => goal.status === Status.Completed)
    .sort((a, b) => {
      const dateA = a.completedDate ? new Date(a.completedDate).getTime() : 0;
      const dateB = b.completedDate ? new Date(b.completedDate).getTime() : 0;
      return dateB - dateA;
    })
    .slice(0, 3);

  const tasksDueSoon: Task[] = taskListData.tasks
    .filter(
      (task) =>
        task.status === Status.InProgress || task.status === Status.ToDo,
    )
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
    .slice(0, 2);

  const chartData: PieChartData[] = [
    {
      id: 0,
      value: taskStats.toDoCount,
      label: StatusDisplay[Status.ToDo].title,
      color: "var(--status-to-do)",
    },
    {
      id: 1,
      value: taskStats.inProgressCount,
      label: StatusDisplay[Status.InProgress].title,
      color: "var(--status-in-progress)",
    },
    {
      id: 2,
      value: taskStats.completedCount,
      label: StatusDisplay[Status.Completed].title,
      color: "var(--status-completed)",
    },
    {
      id: 3,
      value: taskStats.onHoldCount,
      label: StatusDisplay[Status.OnHold].title,
      color: "var(--status-on-hold)",
    },
    {
      id: 4,
      value: taskStats.cancelledCount,
      label: StatusDisplay[Status.Cancelled].title,
      color: "var(--status-cancel)",
    },
    {
      id: 5,
      value: taskStats.overdueCount,
      label: StatusDisplay[Status.Overdue].title,
      color: "var(--status-overdue)",
    },
  ];

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
            <StatusCardList
              totalGoal={goalStats.totalCount}
              completedGoal={goalStats.completedCount}
              inProgressGoal={goalStats.inProgressCount}
              overdueGoal={goalStats.overdueCount}
            />
            <Grid columns={{ initial: "1", md: "2fr 1fr" }} gap="5">
              <Grid
                rows={{ initial: "1", md: "1fr auto" }}
                columns={{ initial: "1", md: "1fr 1fr" }}
                gap="5"
              >
                <Box gridRow="1" gridColumn="1">
                  <PieChartCard
                    data={chartData}
                    header="Task Statistics"
                    subHeader="Overview of your tasks"
                  />
                </Box>
                <Box gridRow="1" gridColumn="2">
                  <RecentGoalList
                    header="Due soon"
                    subHeader="Tasks Nearing Deadline"
                    icon={Clock}
                    data={tasksDueSoon}
                    cardTypeComponent={KanbanItem}
                  />
                </Box>
                <Box gridRow="2" gridColumnStart="1" gridColumnEnd="3">
                  <ContributionGraph
                    header="Productivity"
                    subHeader="Your activity over time"
                  />
                </Box>
              </Grid>
              <RecentGoalList
                header="Recent Goals"
                subHeader="Track the progress of current goals"
                icon={TrendingUp}
                data={recentGoals}
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
