"use client";

import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { Header } from "@/app/components/header/header";
import { Input } from "@headlessui/react";
import { Flex, Text } from "@radix-ui/themes";
import { CloudUpload } from "lucide-react";
import { useRef, useState } from "react";
import styles from "./file-input-form.module.scss";

export function FileInputForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

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
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFiles(files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
    console.log("Files selected:", formData.get("files"));
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
        <Input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.txt"
          style={{ display: "none" }}
          onChange={handleChange}
        />
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="3"
          py="5"
          flexGrow="1"
          onClick={() => inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          style={{
            border: `2px dashed ${isDragging ? "var(--status-in-progress)" : "var(--card-border)"}`,
            backgroundColor: isDragging ? "var(--background)" : "transparent",
          }}
          className={styles.fileInput}
        >
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
            Support: PDF, DOC, DOCX, TXT (Max 10MB each file)
          </Text>
        </Flex>
      </Flex>
    </CardNoPadding>
  );
}
