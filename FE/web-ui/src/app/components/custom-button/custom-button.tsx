import { Button } from "@radix-ui/themes";
import styles from "./custom-button.module.scss";
import { ButtonType } from "@/app/enum/button-type.enum";

interface CustomButtonProps extends React.ComponentProps<typeof Button> {
  children: React.ReactNode;
  buttonType: ButtonType;
  isActive?: boolean;
}

export function CustomButton({
  children,
  buttonType,
  isActive,
  ...props
}: CustomButtonProps) {
  return (
    <Button
      radius="large"
      disabled={isActive}
      className={`${styles[`${buttonType}Button`]} ${isActive ? styles.active : ""}`}
      {...props}
    >
      {children}
    </Button>
  );
}
