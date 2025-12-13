import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { Flex, Kbd, Progress, Text } from "@radix-ui/themes";
import { Calendar, CheckCircle, Clock, Target } from "lucide-react";
import styles from "./goal-card.module.scss";
import { GoalCardPropsData } from "@/app/tm/workspace/dashboard/components/recent-goal-list/recent-goal-list";
import { StatusDropDown } from "../status-dropdown/status-dropdown";
import { StatusCard, StatusCardProps } from "../status-card/status-card";
import React from "react";

export function GoalCard({
  name,
  status,
  description,
  tag,
  completedCount,
  taskCount,
  deadline,
  progress,
  isDetailCard = false,
  isPrimary = false,
}: GoalCardPropsData) {
  const currentDate: Date = new Date();
  const cardContent: StatusCardProps[] = [
    {
      label: "Progress",
      value: `${progress}%`,
      icon: <Target size="30" className={styles.inProgress} />,
    },
    {
      label: "Completed",
      value: `${completedCount}/${taskCount}`,
      icon: <CheckCircle size="30" className={styles.completed} />,
    },
    {
      label: "Deadline",
      value: `${deadline.toISOString().split("T")[0]}`,
      icon: <Calendar size="30" className={styles.cancel} />,
    },
    {
      label: "Estimated time remaining",
      value: `${Math.ceil(
        (deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24)
      )} days`,
      icon: <Clock size="30" className={styles.onHold} />,
    },
  ];

  return (
    <CardNoPadding p={isDetailCard ? "5" : "3"} isPrimary={isPrimary}>
      <Flex direction="column" width="100%" height="100%" gap="3">
        <Flex
          width="100%"
          height="100%"
          direction="column"
          gap={isDetailCard ? "2" : "1"}
        >
          <Text size={isDetailCard ? "6" : "2"} weight="regular">
            {name}
          </Text>
          <Flex justify="between" className={styles.subText}>
            <Flex gap="5" align="center">
              <Flex gap="1" align="center">
                {tag?.map((value, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && (
                      <Text size={isDetailCard ? "2" : "1"} weight="bold"> · </Text>
                    )}
                    <Text size={isDetailCard ? "2" : "1"}>{value}</Text>
                  </React.Fragment>
                ))}
              </Flex>
              {status && <StatusDropDown status={status} />}
            </Flex>
            {!isDetailCard && (
              <Text size="1">{deadline.toISOString().split("T")[0]}</Text>
            )}
          </Flex>
          {!isDetailCard && <Progress value={progress} size="2" highContrast />}
        </Flex>
        {description && (
          <Text size="2" className={styles.subText}>
            {description}
          </Text>
        )}
        {isDetailCard && (
          <Flex gap="3" align="center">
            {cardContent.map((value, index) => (
              <StatusCard key={index} {...value} />
            ))}
          </Flex>
        )}
      </Flex>
    </CardNoPadding>
  );
}
