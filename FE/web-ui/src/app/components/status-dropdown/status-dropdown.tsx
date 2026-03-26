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
    <Select.Root
      value={status}
      onValueChange={(value) => onStatusChange?.(value as Status)}
      disabled={!isDropdown}
      size="1"
    >
      <Select.Trigger
        className={styles.statusTrigger}
        style={{ cursor: isDropdown ? "pointer" : "default" }}
        data-testid="status-dropdown"
      >
        <Flex
          className={`${styles.status} ${styles[status]}`}
          px="2"
          py="1"
          align="center"
          justify="center"
        >
          <Text size="1" trim="both">
            {status}
          </Text>
        </Flex>
      </Select.Trigger>
      <Select.Content position="item-aligned" className={styles.statusContent}>
        <Select.Group>
          <Flex direction="column" gap="1">
            {Object.values(Status).map((value) => (
              <Select.Item
                key={value}
                value={value}
                className={`${styles.selectItem} ${styles[value]}`}
              >
                {value}
              </Select.Item>
            ))}
          </Flex>
        </Select.Group>
      </Select.Content>
    </Select.Root>
  );
}
