import {
  StatusCard,
  StatusCardProps,
} from "@/app/components/status-card/status-card";
import { Grid } from "@radix-ui/themes";
import { Calendar, CheckCircle, Clock, Target } from "lucide-react";
import styles from "./status-card-list.module.scss";

export interface StatusCardListProps {
  totalGoal: number;
  completedGoal: number;
  inProgressGoal: number;
  overdueGoal: number;
}
export function StatusCardList({
  totalGoal,
  completedGoal,
  inProgressGoal,
  overdueGoal,
}: StatusCardListProps) {
  const cardContent: StatusCardProps[] = [
    {
      label: "Total Goal",
      value: totalGoal.toString(),
      icon: <Target size="30" className={styles.toDo} />,
    },
    {
      label: "Completed",
      value: completedGoal.toString(),
      icon: <CheckCircle size="30" className={styles.completed} />,
    },
    {
      label: "In Progress",
      value: inProgressGoal.toString(),
      icon: <Clock size="30" className={styles.inProgress} />,
    },
    {
      label: "Overdue",
      value: overdueGoal.toString(),
      icon: <Calendar size="30" className={styles.overdue} />,
    },
  ];
  return (
    <Grid
      columns={{ initial: "1", xs: "2", lg: "4" }}
      gap="5"
      width="100%"
      data-testid="status-card-list"
    >
      {cardContent.map((value, index) => (
        <StatusCard key={index} {...value} isPrimary />
      ))}
    </Grid>
  );
}
