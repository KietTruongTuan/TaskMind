import { Flex, Heading, Text } from "@radix-ui/themes";
import styles from "./header.module.scss";
import { SkeletonLoading } from "../skeleton-loading/skeleton-loading";

type HeaderProps = {
  text: string;
  subText?: string;
  textSize: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  subTextSize?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  icon?: React.ReactElement;
  isLoading?: boolean;
};

export function Header({
  text,
  subText,
  textSize,
  subTextSize,
  icon,
  isLoading = false,
}: HeaderProps) {
  return (
    <>
      <Flex align="end" justify="start" gap="1">
        <SkeletonLoading isLoading={isLoading}>
          {icon}
          <Heading weight="medium" size={textSize}>
            {text}
          </Heading>
        </SkeletonLoading>
      </Flex>
      <SkeletonLoading isLoading={isLoading}>
        <Text weight="regular" className={styles.subText} size={subTextSize}>
          {subText}
        </Text>
      </SkeletonLoading>
    </>
  );
}
