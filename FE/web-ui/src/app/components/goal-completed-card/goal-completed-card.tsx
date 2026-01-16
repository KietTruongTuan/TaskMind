import { Flex } from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { CheckCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Header } from "../header/header";
import styles from "./goal-completed-card.module.scss";

export function GoalCompletedCard({
  name,
  completedDate,
}: {
  name: string;
  completedDate: Date;
}) {
  const time = formatDistanceToNow(completedDate, { addSuffix: true });
  return (
    <CardNoPadding p="3">
      <Flex direction="column" width="100" align="center" gap="1">
        <CheckCircle size="30" className={styles.completed} />
        <Header
          text={name}
          subText={`Completed ${time}`}
          textSize="2"
          subTextSize="1"
        />
      </Flex>
    </CardNoPadding>
  );
}
