"use client";
import { CardNoPadding } from "@/app/components/card-no-padding/card-no-padding";
import { KnowledgeBaseResponseBody } from "@/app/constants/knowledge-base.constants";
import { CheckboxGroup, Flex, Text } from "@radix-ui/themes";
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
      <Flex direction="column" width="100%" gap="2">
        <CheckboxGroup.Item
          key={document.id}
          value={document.id}
          className={styles.fullWidthCheckbox}
        >
          <Flex width="100%" justify="between" align="center">
            <Flex gap="2" align="center">
              <FontAwesomeIcon
                icon={FileTypeDisplay[document.fileType].icon}
                style={{
                  height: "40px",
                  width: "40px",
                  color: FileTypeDisplay[document.fileType].color,
                  flexShrink: 0,
                }}
              />
              <Flex direction="column" gap="1">
                <Text weight="regular" size="2" className={styles.textOverflow}>
                  {document.name}
                </Text>
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
              </Flex>
            </Flex>

            <Icon
              className={
                FileStatusDisplay[document.status].isSpinning
                  ? styles.spinningIcon
                  : ""
              }
              size={25}
              style={{ flexShrink: 0 }}
              color={FileStatusDisplay[document.status].color}
            />
          </Flex>
        </CheckboxGroup.Item>

        <Flex gap="1" align="start">
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
    </CardNoPadding>
  );
}
