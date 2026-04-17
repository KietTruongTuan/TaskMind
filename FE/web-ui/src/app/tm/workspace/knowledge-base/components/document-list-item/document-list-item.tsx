import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { KnowledgeBaseResponseBody } from "@/app/constants/knowledge-base.constants";
import { Flex, Text } from "@radix-ui/themes";
import styles from "./document-list-item.module.scss";
import { FileStatusDisplay, FileTypeDisplay } from "@/app/constants";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
export function DocumentListItem({
  document,
}: {
  document: KnowledgeBaseResponseBody;
}) {
  const Icon = FileStatusDisplay[document.status].icon;
  const MessageIcon = FileStatusDisplay[document.status].messageIcon;
  return (
    <CardNoPadding py="3" px="4" height="auto">
      <Flex width="100%" justify="between" align="center">
        <Flex gap="2" align="center">
          <FontAwesomeIcon
            icon={FileTypeDisplay[document.fileType].icon}
            style={{
              height: "40px",
              width: "40px",
              color: FileTypeDisplay[document.fileType].color,
            }}
          />
          <Flex direction="column" gap="1">
            <Text weight="regular">{document.name}</Text>
            <Flex gap="2" align="center" className={styles.subText}>
              <Text size="1">{document.size}</Text>
              <Text size="1">•</Text>
              <Text size="1">
                {new Date(document.uploadDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hourCycle: "h23",
                })}
              </Text>
            </Flex>

            <Flex gap="1" align="center">
              <MessageIcon
                size={14}
                color={FileStatusDisplay[document.status].color}
              />
              <Text
                size="1"
                style={{ color: FileStatusDisplay[document.status].color }}
              >
                {document.message || FileStatusDisplay[document.status].message}
              </Text>
            </Flex>
          </Flex>
        </Flex>

        <Icon size={30} color={FileStatusDisplay[document.status].color} />
      </Flex>
    </CardNoPadding>
  );
}
