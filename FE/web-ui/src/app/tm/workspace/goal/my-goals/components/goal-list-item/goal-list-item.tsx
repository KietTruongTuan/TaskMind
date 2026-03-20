"use client";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { GoalListItemResponseBody } from "@/app/constants";
import { Flex, Progress, Text } from "@radix-ui/themes";
import { Fragment } from "react";
import styles from "./goal-list-item.module.scss";
import { Clock } from "lucide-react";
import { StatusDropDown } from "@/app/components/status-dropdown/status-dropdown";

import { buildUrl } from "@/app/tm/utils";
import { WebUrl } from "@/app/enum/web-url.enum";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";

export function GoalListItem({ goal }: { goal: GoalListItemResponseBody }) {
  const {
    id,
    name,
    description,
    status,
    deadline,
    tag,
    completedCount,
    taskCount,
  } = goal;
  const { route } = useRouteLoadingContext();
  const progress: number = Math.round(
    taskCount === 0 ? 0 : (completedCount * 100) / taskCount,
  );

  return (
    <CardNoPadding p="4" isPrimary>
      <Flex direction="column" width="100%" height="100%" gap="4">
        <Flex width="100%" height="100%" justify="between">
          <Flex width="100%" height="100%" direction="column">
            <Text
              size="3"
              weight="medium"
              onClick={() => route(buildUrl(WebUrl.GoalDetail, id))}
              style={{ cursor: "pointer", width: "auto" }}
            >
              {name}
            </Text>
            <Flex gap="1" align="center" className={styles.subText}>
              {tag?.map((value, index) => (
                <Fragment key={index}>
                  {index > 0 && (
                    <Text size="1" weight="bold">
                      {" "}
                      ·{" "}
                    </Text>
                  )}
                  <Text size="1">{value}</Text>
                </Fragment>
              ))}
            </Flex>
          </Flex>
        </Flex>
        <Flex direction="column" width="100%" gap="4">
          <Text
            size="2"
            className={`${styles.subText} ${styles.descriptionOverflow}`}
          >
            {description}
          </Text>
          <Flex direction="column" width="100%" gap="2">
            <Flex width="100%" justify="between">
              <Text size="1" className={styles.subText}>
                Progress
              </Text>
              <Text size="1">{`${progress}%`}</Text>
            </Flex>
            <Flex direction="column" gap="1" width="100%">
              <Progress value={progress} size="2" highContrast />
              <Text
                size="1"
                className={styles.subText}
              >{`${completedCount}/${taskCount}`}</Text>
            </Flex>
          </Flex>
          <Flex width="100%" justify="between">
            <StatusDropDown status={status} />
            <Flex gap="1" className={styles.subText}>
              <Clock size={15} />
              <Text size="1">
                {new Date(deadline).toISOString().split("T")[0]}
              </Text>
            </Flex>
          </Flex>
        </Flex>
      </Flex>
    </CardNoPadding>
  );
}
