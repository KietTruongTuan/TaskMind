import { Flex, AlertDialog } from "@radix-ui/themes";
import { CustomButton } from "../custom-button/custom-button";
import { ButtonType } from "@/app/enum/button-type.enum";
import styles from "./alert-dialog-pop-up.module.scss"
interface AlertDialogProps {
  title: string;
  description: string;
  actionText: string;
  action: () => void;
  children: React.ReactNode;
}
export function AlertDialogPopUp({
  title,
  description,
  actionText,
  action,
  children,
}: AlertDialogProps) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>{children}</AlertDialog.Trigger>
      <AlertDialog.Content maxWidth="40%" className={styles.dialogContent}>
        <AlertDialog.Title size="5">{title}</AlertDialog.Title>
        <AlertDialog.Description size="2" className={styles.dialogDescription}>
          {description}
        </AlertDialog.Description>

        <Flex gap="3" mt="4" justify="end">
          <AlertDialog.Cancel>
            <CustomButton buttonType={ButtonType.Secondary}>Cancel</CustomButton>
          </AlertDialog.Cancel>
          <AlertDialog.Action onClick={action}>
            <CustomButton buttonType={ButtonType.Warning} >
              {actionText}
            </CustomButton>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
