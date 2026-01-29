import { Flex } from "@radix-ui/themes";
import { BarItems } from "../bar-items/bar-items";
import styles from "./side-bar.module.scss";

export function SideBar() {
  return (
    <Flex height="100%" py="2" pl="1">
      <Flex
        direction="column"
        height="100%"
        align="center"
        p="4"
        className={styles.sideBar}
      >
        <BarItems />
      </Flex>
    </Flex>
  );
}
