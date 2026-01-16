import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { Header } from "@/app/components/header/header";
import { Status } from "@/app/enum/status.enum";
import { Flex } from "@radix-ui/themes";
import { ElementType } from "react";

export interface GoalCardPropsData {
  name: string;
  status: Status;
  description?: string;
  tag: string[];
  deadline: Date;
  completedDate?: Date;
  completedCount: number;
  taskCount: number;
  isDetailCard?: boolean;
  isPrimary?: boolean;
}

export function RecentGoalList({
  isFlexible = false,
  header,
  icon,
  subHeader,
  cardTypeComponent,
  data,
}: {
  isFlexible?: boolean;
  header: string;
  icon?: ElementType;
  subHeader: string;
  cardTypeComponent: ElementType;
  data: GoalCardPropsData[];
}) {
  const Card = cardTypeComponent;
  const Icon = icon;
  return (
    <CardNoPadding py="5" px="5" data-testid="recent-list" isPrimary>
      <Flex direction="column" width="100%" gap="1" mb="3">
        <Header
          text={header}
          subText={subHeader}
          textSize="2"
          subTextSize="1"
          icon={Icon ? <Icon size={18} /> : undefined}
        />
      </Flex>
      <Flex
        width="100%"
        direction={isFlexible ? { initial: "column", md: "row" } : "column"}
        gap="3"
      >
        {data.map((value, index) => (
          <Card key={index} {...value} />
        ))}
      </Flex>
    </CardNoPadding>
  );
}
