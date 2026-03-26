import { Header } from "@/app/components/header/header";
import { KanbanBoard } from "@/app/components/kanban-board/kanban-board";
import { SearchBar } from "@/app/components/search-bar/search-bar";
import { SearchParams } from "@/app/enum/search-params.enum";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import { Box, Flex, Text } from "@radix-ui/themes";

export default async function AllTaskPage({
  searchParams,
}: {
  searchParams: Promise<
    Record<SearchParams, string | string[] | null | undefined>
  >;
}) {
  const params = await searchParams;
  const { taskService } = await useServerSideService();
  const taskListData = await taskService.getAll(params);

  return (
    <Flex width="100%" justify="center" height="100%">
      <Flex width="100%" direction="column" pl="7" py="5" gap="5">
        <Box>
          <Header
            text="All Tasks"
            subText="Use Kanban board to manage your tasks"
            textSize="7"
            subTextSize="2"
          />
        </Box>

        <Flex width="50%" gap="2">
          <SearchBar value={(params[SearchParams.Search] as string) || ""} />
        </Flex>

        {taskListData.length === 0 ? (
          <Flex height="100%" width="100%" justify="center" align="center">
            <Text size="2" align="center" mt="3">
              No task found
            </Text>
          </Flex>
        ) : (
          <KanbanBoard tasks={taskListData} />
        )}
      </Flex>
    </Flex>
  );
}
