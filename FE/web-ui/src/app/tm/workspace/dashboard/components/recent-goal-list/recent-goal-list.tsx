import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { Header } from "@/app/components/header/header";
import { GoalResponseBody } from "@/app/constants";
import { Flex, Text } from "@radix-ui/themes";
import { ElementType } from "react";

export interface GoalCardPropsData extends GoalResponseBody {
  id?: string;
  isDetailCard?: boolean;
  isPrimary?: boolean;
  isDraft?: boolean;
}

export function RecentGoalList<T>({
  isFlexible = false,
  header,
  icon,
  subHeader,
  nullMessage,
  cardTypeComponent,
  data,
}: {
  isFlexible?: boolean;
  header: string;
  icon?: ElementType;
  subHeader: string;
  nullMessage: string;
  cardTypeComponent: ElementType;
  data: T[];
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
      {data.length === 0 ? (
        <Flex
          align="center"
          justify="center"
          width="100%"
          height="100%"
        >
          <Text size="1">{nullMessage}</Text>
        </Flex>
      ) : (
        <Flex
          width="100%"
          direction={isFlexible ? { initial: "column", md: "row" } : "column"}
          gap="3"
        >
          {data.map((value, index) => (
            <Card key={index} {...value} />
          ))}
        </Flex>
      )}
    </CardNoPadding>
  );
}
