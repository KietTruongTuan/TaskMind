import { Flex } from "@radix-ui/themes";
import styles from "./card-no-padding.module.scss";
type CardProps = React.ComponentProps<typeof Flex> & {
  children: React.ReactNode;
  isPrimary?: boolean;
};

export function CardNoPadding({
  children,
  isPrimary = false,
  ...props
}: CardProps) {
  return (
    <Flex
      width="100%"
      height="100%"
      className={styles.cardNoPadding}
      direction="column"
      align="center"
      style={{
        backgroundColor: isPrimary
          ? "var(--card-primary)"
          : "var(--card-secondary)",
      }}
      {...props}
    >
      {children}
    </Flex>
  );
}
