"use client";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { Header } from "@/app/components/header/header";
import { InputFileArea } from "@/app/components/input-file-area/input-file-area";
import { ApiError, knowledgeBaseService } from "@/app/constants";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { Flex } from "@radix-ui/themes";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function FileInputForm() {
  const { setIsSuccess, showToast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();

  const handleUploadFiles = async (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    try {
      setIsUploading(true);
      const res = await knowledgeBaseService.upload(formData);
      console.log(res);
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
          isLoading={isUploading}
        />
      </Flex>
    </CardNoPadding>
  );
}
