"use client";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { Header } from "@/app/components/header/header";
import { InputFileArea } from "@/app/components/input-file-area/input-file-area";
import { ApiError, knowledgeBaseService } from "@/app/constants";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { FileType } from "@/app/enum/file-type.enum";
import { Flex } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FileInputForm() {
  const { setIsSuccess, showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleUploadFiles = async (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    try {
      setIsUploading(true);
      const res = await knowledgeBaseService.upload(formData);
      setIsSuccess(true);
      router.refresh();
      showToast("Your file is successfully uploaded");
    } catch (err) {
      setIsSuccess(false);
      const error = err as ApiError;
      showToast(error.message);
    } finally {
      setIsUploading(false);
    }
  };
  const isValidInput = (files: File[]) => {
    if (files.length > 5) {
      setIsSuccess(false);
      showToast("You can only upload 5 files at a time");
      return false;
    }
    return true;
  };
  return (
    <CardNoPadding p="5" isPrimary>
      <Flex direction="column" width="100%" height="100%" gap="4">
        <Flex direction="column" width="100%" gap="1">
          <Header
            text="Upload Document"
            subText="Drag and drop documents here or click to select from your computer"
            textSize="2"
            subTextSize="1"
          />
        </Flex>
        <InputFileArea
          handleUpload={handleUploadFiles}
          isValid={isValidInput}
          allowedFileTypes={[FileType.Pdf, FileType.Docx]}
          isLoading={isUploading}
        />
      </Flex>
    </CardNoPadding>
  );
}
