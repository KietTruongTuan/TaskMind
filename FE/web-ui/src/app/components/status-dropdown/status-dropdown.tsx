import { Status } from "@/app/enum/status.enum";
import { Flex, Select, Text } from "@radix-ui/themes";
import styles from "./status-dropdown.module.scss";
import { StatusDisplay } from "@/app/constants";

export function StatusDropDown({
  status,
  onStatusChange,
  isDropdown = false,
}: {
  status: Status;
  onStatusChange?: (status: Status) => void;
  isDropdown?: boolean;
}) {
  return (
    <Flex
      className={`${styles.status} ${styles[status]}`}
      px="2"
      py="1"
      align="center"
      justify="center"
      data-testid="status-dropdown"
    >
      <Text size="1">{status}</Text>
    </Flex>
  );
}
