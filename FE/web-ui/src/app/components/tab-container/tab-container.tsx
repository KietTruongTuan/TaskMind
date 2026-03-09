import { Box, Tabs, Text } from "@radix-ui/themes";
import { TabList } from "../tab-list/tab-list";

export interface TabListProps {
  label: string;
  component: React.ReactNode;
  icon?: React.ReactNode;
}

export function TabContainer({
  tabList,
  isDraft = false,
}: {
  tabList: TabListProps[];
  isDraft?: boolean;
}) {
  return (
    <Tabs.Root defaultValue={tabList[0].label}>
      {!isDraft && <TabList tabList={tabList} />}

      <Box pt="3">
        {tabList?.map((tab) => (
          <Tabs.Content key={tab.label} value={tab.label}>
            <Text>{tab.component}</Text>
          </Tabs.Content>
        ))}
      </Box>
    </Tabs.Root>
  );
}
