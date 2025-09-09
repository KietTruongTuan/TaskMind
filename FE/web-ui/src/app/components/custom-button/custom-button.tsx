import { Button } from "@radix-ui/themes";
import styles from "./custom-button.module.scss";

interface CustomButtonProps extends React.ComponentProps<typeof Button> {
  children: string;
}

export function CustomButton({ children, ...props }: CustomButtonProps) {
  return (
    <Button radius="large" className={styles.button} {...props}>
      {children}
    </Button>
  );
}
