import { Flex } from "@radix-ui/themes";
import { Target } from "lucide-react";
import styles from "./logo-icon.module.scss";

export function LogoIcon({ size }: { size: string }) {
  return (
    <Flex className={styles.gradientBox} justify="center" align="center" p="1">
      <Target color="white" size={size}/>
    </Flex>
  );
}
