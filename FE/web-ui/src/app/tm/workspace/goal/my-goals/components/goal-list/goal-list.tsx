import { GoalListItemResponseBody } from "@/app/constants";
import { GoalListItem } from "../goal-list-item/goal-list-item";
import { Box, Flex } from "@radix-ui/themes";

export function GoalList({
  goalList,
}: {
  goalList: GoalListItemResponseBody[];
}) {
  return (
    <Flex gap="3" wrap="wrap">
      {goalList.map((goal) => (
        <Box
          key={goal.id}
          flexBasis={{
            initial: "calc(100% - 0.75rem)",
            sm: "calc(50% - 0.75rem)",
            md: "calc(33.333% - 0.75rem)",
            lg: "calc(25% - 0.75rem)",
          }}
          flexShrink="0"
          minWidth="0"
        >
          <GoalListItem goal={goal} />
        </Box>
      ))}
    </Flex>
  );
}
