import { Status } from "@/app/enum/status.enum";
import { Flex, Text } from "@radix-ui/themes";
import styles from "./status-dropdown.module.scss";
export function StatusDropDown({ status }: { status: Status }) {
  return (
    <Flex className={`${styles.status} ${styles[status]}`} px="2" py="1" align="center" justify="center">
      <Text size="1">{status}</Text>
    </Flex>
  );
}
