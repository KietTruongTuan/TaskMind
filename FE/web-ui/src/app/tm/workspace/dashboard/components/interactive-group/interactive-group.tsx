"use client";
import { Box, Grid } from "@radix-ui/themes";
import { PieChartCard, PieChartData } from "../pie-chart-card/pie-chart-card";
import {
  GoalCardPropsData,
  RecentGoalList,
} from "../recent-goal-list/recent-goal-list";
import { Clock, TrendingUp } from "lucide-react";
import { KanbanItem } from "@/app/components/kanban-item/kanban-item";
import { ContributionGraph } from "../contribution-graph/contribution-graph";
import { GoalCard } from "@/app/components/goal-card/goal-card";
import {
  GoalListItemResponseBody,
  StatusDisplay,
  Task,
  TaskProductivityResponseBody,
} from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { useState } from "react";

export function InteractiveGroup({
  tasks,
  goals,
  chartData,
  taskProductivityData,
}: {
  goals: GoalListItemResponseBody[];
  tasks: Task[];
  chartData: PieChartData[];
  taskProductivityData: TaskProductivityResponseBody[];
}) {
  const [statusFilter, setStatusFilter] = useState<Status | undefined>(
    undefined,
  );
  const [dateFilter, setDateFilter] = useState<string | undefined>(undefined);

  const tasksDueSoon: Task[] = tasks
    .filter((task) => {
      const matchStatus = statusFilter
        ? task.status === statusFilter
        : task.status === Status.InProgress || task.status === Status.ToDo;
      const matchDate = dateFilter
        ? new Date(task.deadline).toDateString() ===
          new Date(dateFilter).toDateString()
        : true;
      return matchStatus && matchDate;
    })
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
    .slice(0, 4);

  const recentGoals: GoalCardPropsData[] = goals
    .filter((goal) => {
      const matchStatus = statusFilter
        ? goal.status === statusFilter
        : goal.status === Status.InProgress;
      const matchDate = dateFilter
        ? new Date(goal.deadline).toDateString() ===
          new Date(dateFilter).toDateString()
        : true;
      return matchStatus && matchDate;
    })
    .sort(
      (a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime(),
    )
    .slice(0, 2);

  return (
    <Grid columns={{ initial: "1", md: "2fr 1fr" }} gap="5">
      <Grid
        rows={{ initial: "auto", md: "1fr auto" }}
        columns={{ initial: "1", md: "1fr 1fr" }}
        gap="5"
      >
        <Box
          gridRow={{ initial: "1", md: "1" }}
          gridColumn={{ initial: "1", md: "1" }}
        >
          <PieChartCard
            data={chartData}
            header="Task Statistics"
            subHeader="Overview of your tasks"
            onStatusClick={(status) => {
              setStatusFilter((prev) => (prev === status ? undefined : status));
            }}
          />
        </Box>
        <Box
          gridRow={{ initial: "4", md: "1" }}
          gridColumn={{ initial: "1", md: "2" }}
        >
          <RecentGoalList
            header={
              statusFilter === undefined
                ? "Recent Goals"
                : `${StatusDisplay[statusFilter].title} goals`
            }
            subHeader="Track the progress of current goals"
            nullMessage="No recent goals available"
            icon={TrendingUp}
            data={recentGoals}
            cardTypeComponent={GoalCard}
          />
        </Box>
        <Box
          gridRow={{ initial: "auto", md: "2" }}
          gridColumnStart={{ initial: "1", md: "1" }}
          gridColumnEnd={{ initial: "2", md: "3" }}
        >
          <ContributionGraph
            header="Productivity"
            subHeader="Your activity over time"
            data={taskProductivityData}
            activeDate={dateFilter || undefined}
            activeColor={
              chartData.find((item) => item.id === statusFilter)?.color
            }
            onDateClick={(date) => {
              setDateFilter((prev) => (prev === date ? undefined : date));
            }}
          />
        </Box>
      </Grid>

      <RecentGoalList
        header={
          statusFilter === undefined
            ? "Due soon"
            : `${StatusDisplay[statusFilter].title} tasks`
        }
        subHeader="Tasks Nearing Deadline"
        nullMessage="No due soon tasks available"
        icon={Clock}
        data={tasksDueSoon}
        cardTypeComponent={KanbanItem}
      />
    </Grid>
  );
}
