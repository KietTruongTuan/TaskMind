"use client";
import { Input } from "@headlessui/react";
import { Flex, Text } from "@radix-ui/themes";
import { CloudUpload } from "lucide-react";
import { useState, useRef, SetStateAction, Dispatch } from "react";
import styles from "./input-file-area.module.scss";
import { FileType } from "@/app/enum/file-type.enum";
import { useToast } from "@/app/contexts/toast-context/toast-context";

export function InputFileArea({
  handleUpload,
  isValid = () => true,
  allowedFileTypes,
  setIsDialogOpen,
  isLoading = false,
}: {
  handleUpload: (files: File[]) => void;
  isValid?: (files: File[]) => boolean;
  setIsDialogOpen?: Dispatch<SetStateAction<boolean>>;
  allowedFileTypes: FileType[];
  isLoading?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { setIsSuccess, showToast } = useToast();
  const checkFileType = (files: File[]) => {
    const invalidFile = files.find((file) => {
      const ext = file.name.split(".").pop()?.toLowerCase() as FileType;
      return !allowedFileTypes.includes(ext);
    });

    if (invalidFile) {
      setIsDialogOpen?.(false);
      setIsSuccess(false);
      showToast("File type is not allowed");
      return false;
    }
    return true;
  };
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      if (checkFileType(files) && isValid(files)) {
        handleUpload(files);
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      if (checkFileType(files) && isValid(files)) {
        handleUpload(files);
      }
    }
  };

  return (
    <>
      <Input
        ref={inputRef}
        type="file"
        multiple
        accept={allowedFileTypes.map((type) => `.${type}`).join(",")}
        style={{ display: "none" }}
        onChange={handleChange}
        disabled={isLoading}
      />
      <Flex
        align="center"
        justify="center"
        py="5"
        flexGrow="1"
        onClick={() => inputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        data-testid="file-drop-zone"
        style={{
          border: `2px dashed ${isDragging ? "var(--status-in-progress)" : "var(--card-border)"}`,
          backgroundColor: isDragging ? "var(--background)" : "transparent",
        }}
        className={styles.fileInput}
      >
        {isLoading ? (
          <Flex align="center" justify="center" gap="2">
            <Text size="2" weight="medium">
              Uploading...
            </Text>
          </Flex>
        ) : (
          <Flex direction="column" align="center" justify="center" gap="3">
            <CloudUpload
              size={48}
              color={
                isDragging ? "var(--status-in-progress)" : "var(--text-primary)"
              }
              style={{ transition: "color 0.2s ease" }}
            />
            <Flex direction="column" align="center" gap="1">
              <Text size="2" weight="medium">
                Drag and drop documents here
              </Text>
              <Text size="1" color="gray">
                or click to select from your computer
              </Text>
            </Flex>
            <Text size="1" color="gray" style={{ textAlign: "center" }}>
              Support: {allowedFileTypes.join(", ")} (Maximum 5 files, 10 MB each)
            </Text>
          </Flex>
        )}
      </Flex>
    </>
  );
}
