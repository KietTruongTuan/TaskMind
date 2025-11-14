import { Heading, Text } from "@radix-ui/themes";
import styles from "./header.module.scss";

type HeaderProps = {
  text: string;
  subText?: string;
  textSize: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  subTextSize?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
};

export function Header({ text, subText, textSize, subTextSize }: HeaderProps) {
  return (
    <>
      <Heading weight="bold" size={textSize}>
        {text}
      </Heading>
      <Text weight="medium" className={styles.subText} size={subTextSize}>
        {subText}
      </Text>
    </>
  );
}
