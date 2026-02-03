import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { Flex, Progress, Text } from "@radix-ui/themes";
import {
  Calendar,
  CheckCircle,
  Clock,
  Pen,
  Trash2,
  TrendingUp,
} from "lucide-react";
import styles from "./goal-card.module.scss";
import { GoalCardPropsData } from "@/app/tm/workspace/dashboard/components/recent-goal-list/recent-goal-list";
import { StatusDropDown } from "../status-dropdown/status-dropdown";
import { StatusCard, StatusCardProps } from "../status-card/status-card";
import React, { Fragment } from "react";
import { CustomButton } from "../custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";

export function GoalCard({
  name,
  status,
  description,
  tag,
  completedCount,
  taskCount,
  deadline,
  isDetailCard = false,
  isPrimary = false,
  isDraft = false,
}: GoalCardPropsData) {
  const currentDate: Date = new Date();
  const progress: number =
    taskCount === 0 ? 0 : (completedCount * 100) / taskCount;
  const cardContent: StatusCardProps[] = [
    {
      label: "Progress",
      value: `${progress}%`,
      icon: <TrendingUp size="30" className={styles.inProgress} />,
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
        (deadline.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24),
      )} days`,
      icon: <Clock size="30" className={styles.onHold} />,
    },
  ];

  return (
    <CardNoPadding p={isDetailCard ? "5" : "3"} isPrimary={isPrimary}>
      <Flex direction="column" width="100%" height="100%" gap="4">
        <Flex width="100%" height="100%" justify="between">
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
                <Flex gap="4" align="center">
                  <Flex gap="2" align="center">
                    {tag?.map((value, index) => (
                      <Fragment key={index}>
                        {index > 0 && (
                          <Text size={isDetailCard ? "2" : "1"} weight="bold">
                            {" "}
                            ·{" "}
                          </Text>
                        )}
                        <Text size={isDetailCard ? "2" : "1"}>{value}</Text>
                      </Fragment>
                    ))}
                  </Flex>
                  {status && <StatusDropDown status={status} />}
                </Flex>
                {!isDetailCard && (
                  <Text size="1">{deadline.toISOString().split("T")[0]}</Text>
                )}
              </Flex>
              {!isDetailCard && (
                <Progress value={progress} size="2" highContrast />
              )}
            </Flex>
            {description && (
              <Text size="2" className={styles.subText}>
                {description}
              </Text>
            )}
          </Flex>
          {isDetailCard && (
            <Flex gap="2">
              <CustomButton buttonType={ButtonType.Primary} size="2">
                <Pen size={14} />
                <Text size="1" weight="regular">
                  Edit
                </Text>
              </CustomButton>
              {!isDraft && (
                <CustomButton buttonType={ButtonType.WarningOutline} size="2">
                  <Trash2 size={14} />
                  <Text size="1" weight="regular">
                    Delete
                  </Text>
                </CustomButton>
              )}
            </Flex>
          )}
        </Flex>
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
