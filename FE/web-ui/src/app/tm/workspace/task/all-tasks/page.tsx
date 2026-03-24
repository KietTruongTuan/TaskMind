import { Header } from "@/app/components/header/header";
import { KanbanBoard } from "@/app/components/kanban-board/kanban-board";
import { SearchParams } from "@/app/enum/search-params.enum";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";
import { Flex } from "@radix-ui/themes";

export default async function AllTaskPage({
  searchParams,
}: {
  searchParams: Promise<Record<SearchParams, string | null | undefined>>;
}) {
  const params = await searchParams;
  const { taskService } = await useServerSideService();
  const taskListData = await taskService.getAll(params);

  return (
    <Flex width="100%" justify="center" height="100%">
      <Flex width="100%" direction="column" pl="7" py="5" gap="2">
        <Header
          text="All Tasks"
          subText="Use Kanban board to manage your tasks"
          textSize="7"
          subTextSize="2"
        />

        <KanbanBoard tasks={taskListData} />
      </Flex>
    </Flex>
  );
}
