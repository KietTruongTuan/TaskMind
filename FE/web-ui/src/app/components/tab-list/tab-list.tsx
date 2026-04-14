import { Flex, Tabs, Text } from "@radix-ui/themes";
import { TabListProps } from "../tab-container/tab-container";
import styles from "./tab-list.module.scss";

export function TabList({ tabList }: { tabList?: TabListProps[] }) {
  return (
    <Tabs.List className={styles.tabList}>
      <Flex gap="1" className={styles.tabListWrapper} p="1">
        {tabList?.map((tab) => (
          <Tabs.Trigger
            key={tab.label}
            value={tab.label}
            className={styles.tabTrigger}
            data-testid={`tab-trigger-${tab.label.toLowerCase()}`}
          >
            <Flex gap="1" align="center">
              {tab.icon}
              <Text size="1">{tab.label}</Text>
            </Flex>
          </Tabs.Trigger>
        ))}
      </Flex>
    </Tabs.List>
  );
}
