"use client";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { KnowledgeBaseResponseBody } from "@/app/constants/knowledge-base.constants";
import { Flex, ScrollArea, Text } from "@radix-ui/themes";
import { DocumentListItem } from "../document-list-item/document-list-item";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { FileStatus } from "@/app/enum/status.enum";

export function DocumentList({
  documents,
}: {
  documents: KnowledgeBaseResponseBody[];
}) {
  const router = useRouter();

  useEffect(() => {
    const hasProcessingFiles = documents.some(
      (doc) =>
        doc.status === FileStatus.Processing || doc.status === FileStatus.Pending
    );

    if (hasProcessingFiles) {
      const interval = setInterval(() => {
        router.refresh();
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [documents, router]);

  return (
    <CardNoPadding p="5" isPrimary>
      <Flex direction="column" width="100%" height="100%" gap="4">
        <Text weight="medium">Document ({documents.length})</Text>
        <ScrollArea
          type="auto"
          scrollbars="vertical"
          style={{ maxHeight: "66vh" }}
        >
          <Flex direction="column" width="100%" height="100%" gap="3" pr="3">
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
        </ScrollArea>
      </Flex>
    </CardNoPadding>
  );
}

