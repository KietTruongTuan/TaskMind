import { GoalSearchParams } from "@/app/enum/search-params.enum";
import { Box, Flex, ScrollArea, Text } from "@radix-ui/themes";
import { Header } from "@/app/components/header/header";
import { GoalListItem } from "./components/goal-list-item/goal-list-item";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";

export default async function MyGoalPage({
  searchParams,
}: {
  searchParams: Promise<Record<GoalSearchParams, string | null | undefined>>;
}) {
  const params = await searchParams;
  const { goalService } = await useServerSideService();
  const goalListData = await goalService.getAll(params);

  return (
    <Flex width="100%" justify="center" height="92vh">
      <Flex width="100%" direction="column" py="5" px="7" gap="5">
        <Box>
          <Header
            text="My Goals"
            subText="Track and manage all your goals"
            textSize="7"
            subTextSize="2"
          />
        </Box>

        <ScrollArea type="auto" scrollbars="vertical">
          <Flex gap="3" wrap="wrap">
            {goalListData.length > 0 ? (
              goalListData.map((goal) => (
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
              ))
            ) : (
              <Flex height="100%" width="100%" justify="center" align="center">
                <Text size="2" align="center" mt="3">
                  No goal found
                </Text>
              </Flex>
            )}
          </Flex>
        </ScrollArea>
      </Flex>
    </Flex>
  );
}
