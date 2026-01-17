import { Flex } from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { Header } from "../header/header";

export interface StatusCardProps {
  label: string;
  value: string;
  icon: React.ReactNode;
  isPrimary?: boolean;
}
export function StatusCard({
  label,
  value,
  icon,
  isPrimary = false,
}: StatusCardProps) {
  return (
    <CardNoPadding p="5" isPrimary={isPrimary}>
      <Flex
        justify="between"
        width="100%"
        height="100%"
        minWidth="0"
        align="center"
      >
        <Flex direction="column-reverse">
          <Header
            text={value.toString()}
            subText={label}
            textSize="5"
            subTextSize="1"
          />
        </Flex>
        <Flex align="center" justify="center">
          {icon}
        </Flex>
      </Flex>
    </CardNoPadding>
  );
}
