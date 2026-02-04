"use client";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { GoalListItemResponseBody } from "@/app/constants";
import { Box, DropdownMenu, Flex, Progress, Text } from "@radix-ui/themes";
import { Fragment } from "react";
import styles from "./goal-list-item.module.scss";
import { Clock, Ellipsis, Pen, Trash2 } from "lucide-react";
import { StatusDropDown } from "@/app/components/status-dropdown/status-dropdown";
import { CustomButton } from "@/app/components/custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";
import { useRouter } from "next/navigation";
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
  const progress: number =
    taskCount === 0 ? 0 : (completedCount * 100) / taskCount;

  return (
    <CardNoPadding p="4" isPrimary>
      <Flex direction="column" width="100%" height="100%" gap="6">
        <Flex width="100%" height="100%" justify="between">
          <Flex width="100%" height="100%" direction="column">
            <Text size="3" weight="medium">
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
          <DropdownMenu.Root modal={false}>
            <DropdownMenu.Trigger>
              <Ellipsis size={20} cursor="pointer" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content variant="soft" side="left">
              <DropdownMenu.Item
                onSelect={(e) => e.preventDefault()}
                className={styles.deleteItem}
              >
                <Flex
                  align="center"
                  gap="2"
                  className={styles.deleteText}
                  width="100%"
                  height="100%"
                  px="2"
                >
                  <Trash2 size={15} />
                  <Text>Delete</Text>
                </Flex>
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
        <Flex direction="column" width="100%" gap="5">
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
          <Flex width="100%" gap="2">
            <CustomButton
              buttonType={ButtonType.Primary}
              size="2"
              style={{ width: "80%" }}
              onClick={() => route(buildUrl(WebUrl.GoalDetail, id))}
            >
              <Text size="1" weight="regular">
                View
              </Text>
            </CustomButton>

            <CustomButton
              buttonType={ButtonType.Secondary}
              size="2"
              style={{ width: "20%" }}
            >
              <Text size="1" weight="regular">
                Edit
              </Text>
            </CustomButton>
          </Flex>
        </Flex>
      </Flex>
    </CardNoPadding>
  );
}
