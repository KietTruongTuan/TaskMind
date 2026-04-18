import { Header } from "@/app/components/header/header";
import { Box, Flex, Grid } from "@radix-ui/themes";
import { DocumentList } from "./components/document-list/document-list";
import { KnowledgeBaseResponseBody } from "@/app/constants/knowledge-base.constants";
import { FileInputForm } from "./components/file-input-form/file-input-form";
import { useServerSideService } from "@/app/hooks/useServerSideService/useServerSideService";

export default async function KnowledgeBasePage() {
  const { knowledgeBaseService } = await useServerSideService();
  const documentListData: KnowledgeBaseResponseBody[] =
    await knowledgeBaseService.getFiles();
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
