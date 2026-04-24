import { AlertDialog, Flex } from "@radix-ui/themes";
import { X, File } from "lucide-react";
import { Header } from "../header/header";
import { InputFileArea } from "../input-file-area/input-file-area";
import { FileType } from "@/app/enum/file-type.enum";
import styles from "./input-file-dialog.module.scss";
import { Dispatch, SetStateAction, useState } from "react";
import { useToast } from "@/app/contexts/toast-context/toast-context";

export function InputFileDialog({
  files,
  setFiles,
}: {
  files: File[];
  setFiles: Dispatch<SetStateAction<File[]>>;
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { setIsSuccess, showToast } = useToast();

  const onUploadFiles = (files: File[]) => {
    setFiles((prev) => [...prev, ...files]);
    setIsDialogOpen(false);
  };
  const isValidInput = (newFiles: File[]) => {
    if (files.length + newFiles.length > 5) {
      setIsSuccess(false);
      setIsDialogOpen(false);
      showToast("You can only upload 5 files");
      return false;
    }
    return true;
  };

  return (
    <AlertDialog.Root open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <AlertDialog.Trigger data-testid="dialog-trigger">
        <Flex
          align="center"
          justify="center"
          className={styles.iconWrapper}
          position="absolute"
          p="2"
          top="5%"
          right="1%"
        >
          <File size={16} />
        </Flex>
      </AlertDialog.Trigger>
      <AlertDialog.Content
        maxWidth={{ initial: "90%", sm: "50%" }}
        height="50vh"
        className={styles.dialogContent}
      >
        <Flex p="4" width="100%" height="100%" direction="column">
          <Flex justify="end" width="100%">
            <AlertDialog.Cancel>
              <X size={20} cursor="pointer" />
            </AlertDialog.Cancel>
          </Flex>
          <Flex width="100%" height="100%" direction="column" gap="2">
            <Header text="Upload file" textSize="3" />
            <InputFileArea
              setIsDialogOpen={setIsDialogOpen}
              isValid={isValidInput}
              handleUpload={onUploadFiles}
              allowedFileTypes={[
                FileType.Pdf,
                FileType.Docx,
                FileType.Jpg,
                FileType.Jpeg,
                FileType.Png,
              ]}
            />
          </Flex>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
