import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { KnowledgeBaseResponseBody } from "@/app/constants/knowledge-base.constants";
import { Flex, Text } from "@radix-ui/themes";
import { DocumentListItem } from "../document-list-item/document-list-item";

export function DocumentList({
  documents,
}: {
  documents: KnowledgeBaseResponseBody[];
}) {
  return (
    <CardNoPadding p="5" isPrimary>
      <Flex direction="column" width="100%" height="100%" gap="3">
        <Text weight="medium">Document ({documents.length})</Text>
        {documents.length === 0 ? (
          <Flex justify="center" align="center" height="100%">
            <Text size="1">No documents uploaded yet</Text>
          </Flex>
        ) : (
          documents.map((doc) => (
            <DocumentListItem key={doc.id} document={doc} />
          ))
        )}
      </Flex>
    </CardNoPadding>
  );
}
