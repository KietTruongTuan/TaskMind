"use client";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { KnowledgeBaseResponseBody } from "@/app/constants/knowledge-base.constants";
import {
  CheckboxGroup,
  DropdownMenu,
  Flex,
  ScrollArea,
  Text,
} from "@radix-ui/themes";
import { DocumentListItem } from "../document-list-item/document-list-item";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FileStatus } from "@/app/enum/status.enum";
import { EllipsisVertical, Trash2 } from "lucide-react";
import { ApiError, knowledgeBaseService } from "@/app/constants";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { AlertDialogPopUp } from "@/app/components/alert-dialog-pop-up/alert-dialog-pop-up";

const RCTCheckboxGroupRoot = CheckboxGroup.Root as React.FC<
  React.ComponentProps<typeof CheckboxGroup.Root> & {
    children?: React.ReactNode;
  }
>;

export function DocumentList({
  documents,
}: {
  documents: KnowledgeBaseResponseBody[];
}) {
  const router = useRouter();
  const [selectedDocuments, setSelectedDocuments] = useState<number[]>([]);
  const { setIsSuccess, showToast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const onDelete = async () => {
    if (selectedDocuments.length === 0) {
      setIsSuccess(false);
      showToast("No document selected");
      setIsDropdownOpen(false);
      return;
    }
    try {
      await knowledgeBaseService.remove({ document_ids: selectedDocuments });
      router.refresh();
      setSelectedDocuments([]);
    } catch (err) {
      const error = err as ApiError;
      setIsSuccess(false);
      showToast(error.message);
    } finally {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    const hasProcessingFiles = documents.some(
      (doc) =>
        doc.status === FileStatus.Processing ||
        doc.status === FileStatus.Pending,
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
        <Flex justify="between" align="center">
          <Text weight="medium">Document ({documents.length})</Text>
          <DropdownMenu.Root
            modal={false}
            open={isDropdownOpen}
            onOpenChange={setIsDropdownOpen}
          >
            <DropdownMenu.Trigger data-testid="delete-menu-trigger">
              <EllipsisVertical size={16} cursor="pointer" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Content variant="soft" color="gray">
              <AlertDialogPopUp
                title="Are you sure?"
                description="This action will delete the document(s) permanently."
                actionText="Delete"
                action={onDelete}
              >
                <DropdownMenu.Item
                  style={{ cursor: "pointer" }}
                  onSelect={(e) => e.preventDefault()}
                >
                  <Trash2 size={14} />
                  <Text size="2">Delete</Text>
                </DropdownMenu.Item>
              </AlertDialogPopUp>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>
        {documents.length === 0 ? (
          <Flex justify="center" align="center" flexGrow="1">
            <Text size="2" color="gray">
              No documents uploaded yet
            </Text>
          </Flex>
        ) : (
          <ScrollArea
            type="auto"
            scrollbars="vertical"
            style={{ maxHeight: "66vh", flexGrow: 1 }}
          >
            <RCTCheckboxGroupRoot
              size="3"
              defaultValue={[]}
              onValueChange={(value: string[]) => {
                setSelectedDocuments(value.map((v) => parseInt(v)));
              }}
              color="gray"
              highContrast
            >
              <Flex
                direction="column"
                width="100%"
                height="100%"
                gap="3"
                pr="3"
              >
                {documents.map((doc) => (
                  <DocumentListItem key={doc.id} document={doc} />
                ))}
              </Flex>
            </RCTCheckboxGroupRoot>
          </ScrollArea>
        )}
      </Flex>
    </CardNoPadding>
  );
}
