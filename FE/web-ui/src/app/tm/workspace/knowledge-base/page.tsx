import { Header } from "@/app/components/header/header";
import { Box, Flex, Grid } from "@radix-ui/themes";
import { DocumentList } from "./components/document-list/document-list";
import { FileStatus } from "@/app/enum/status.enum";
import { KnowledgeBaseResponseBody } from "@/app/constants/knowledge-base.constants";
import { FileType } from "@/app/enum/file-type.enum";
import { FileInputForm } from "./components/file-input-form/file-input-form";

export default async function KnowledgeBasePage() {
  const documentListData: KnowledgeBaseResponseBody[] = [
    {
      id: "1",
      name: "Doc1",
      fileType: FileType.Pdf,
      size: "2 MB",
      uploadDate: new Date("2024-01-01T10:00:00"),
      status: FileStatus.Done,
      message: "Document uploaded successfully",
    },
    {
      id: "2",
      name: "Doc2",
      fileType: FileType.Docx,
      size: "1 GB",
      uploadDate: new Date("2025-05-01T08:30:00"),
      status: FileStatus.Processing,
      message: "Document is being processed",
    },
    {
      id: "3",
      name: "Doc3",
      fileType: FileType.Pdf,
      size: "10 MB",
      uploadDate: new Date("2026-03-01T14:45:00"),
      status: FileStatus.Failed,
      message: "Document upload failed",
    },
    {
      id: "4",
      name: "Doc4",
      fileType: FileType.Pdf,
      size: "10 MB",
      uploadDate: new Date("2026-03-01T14:45:00"),
      status: FileStatus.Failed,
      message: "Document upload failed",
    },
    {
      id: "5",
      name: "Doc5",
      fileType: FileType.Pdf,
      size: "10 MB",
      uploadDate: new Date("2026-03-01T14:45:00"),
      status: FileStatus.Failed,
      message: "Document upload failed",
    },
    {
      id: "6",
      name: "Doc6",
      fileType: FileType.Pdf,
      size: "10 MB",
      uploadDate: new Date("2026-03-01T14:45:00"),
      status: FileStatus.Failed,
      message: "Document upload failed",
    },
    {
      id: "7",
      name: "Doc7",
      fileType: FileType.Pdf,
      size: "10 MB",
      uploadDate: new Date("2026-03-01T14:45:00"),
      status: FileStatus.Failed,
      message: "Document upload failed",
    },
    {
      id: "8",
      name: "Doc8",
      fileType: FileType.Docx,
      size: "10 MB",
      uploadDate: new Date("2026-03-01T14:45:00"),
      status: FileStatus.Failed,
      message: "Document upload failed",
    },
    {
      id: "9",
      name: "Doc9",
      fileType: FileType.Pdf,
      size: "10 MB",
      uploadDate: new Date("2026-03-01T14:45:00"),
      status: FileStatus.Failed,
      message: "Document upload failed",
    },
    {
      id: "10",
      name: "Doc10",
      fileType: FileType.Docx,
      size: "10 MB",
      uploadDate: new Date("2026-03-01T14:45:00"),
      status: FileStatus.Failed,
      message: "Document upload failed",
    },
  ];
  return (
    <Flex width="100%" justify="center" height="100%">
      <Flex width="100%" direction="column" py="5" gap="5">
        <Box>
          <Header
            text="Knowledge Base"
            subText="Upload documents to build your knowledge base"
            textSize="7"
            subTextSize="2"
          />
        </Box>
        <Grid columns={{ initial: "1", md: "2fr 1fr" }} gap="5" height="100%">
          <FileInputForm />
          <DocumentList documents={documentListData} />
        </Grid>
      </Flex>
    </Flex>
  );
}
