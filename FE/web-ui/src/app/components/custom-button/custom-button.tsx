import { Button } from "@radix-ui/themes";
import styles from "./custom-button.module.scss";

interface CustomButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
  isActive?: boolean;
}

export function CustomButton({
  children,
  isActive,
  ...props
}: CustomButtonProps) {
  return (
    <Button
      radius="large"
      className={`${
        props.variant === "ghost" ? styles.ghostButton : styles.button
      } ${isActive ? styles.active : ""}`}
      {...props}
    >
      {children}
    </Button>
  );
}
