import { Flex, TextArea, TextField, Text } from "@radix-ui/themes";
import { Pen, X } from "lucide-react";
import { KeyboardEvent, useState, useEffect } from "react";

import styles from "./edit-field.module.scss";

interface EditFieldProps {
  children: React.ReactNode;
  iconSize: number;
  fieldName: string;
  fieldSize?: "1" | "2" | "3";
  fieldLength?: string;
  type: "text" | "date";
  value: string;
  isEditing: boolean;
  isMultiLine?: boolean;
  isMultiInput?: boolean;
  onEditStart?: () => void;
  onChange?: (newValue: string) => void;
  onSave?: () => void;
  onCancel?: () => void;
  isDetailCard?: boolean;
}
export function EditField({
  children,
  iconSize,
  fieldName,
  fieldSize,
  fieldLength = "100%",
  type,
  value,
  isEditing,
  onEditStart = () => {},
  onChange = () => {},
  onSave = () => {},
  onCancel = () => {},
  isMultiLine = false,
  isMultiInput = false,
  isDetailCard = false,
}: EditFieldProps) {
  const handleKeyDown = (
    e: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === "Enter") {
      onSave();
    } else if (e.key === "Escape") {
      onCancel();
    }
  };

  const [selected, setSelected] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isMultiInput) {
      if (!value) {
        setSelected([]);
        return;
      }
      const parts = value
        .split(",")
        .map((p) => p.trim())
        .filter(Boolean);
      setSelected(parts);
    }
  }, [value, isMultiInput]);

  const onAddTag = () => {
    const trimmed = query.trim();
    if (!trimmed || selected.includes(trimmed)) return;
    const tags = [...selected, trimmed];
    setSelected(tags);
    setQuery("");
    onChange(tags.join(", "));
  };

  const onDeleteTag = (index: number) => {
    const tags = selected.filter((_, i) => i !== index);
    setSelected(tags);
    onChange(tags.join(", "));
  };

  if (!isEditing) {
    return (
      <Flex
        gap="1"
        align={isMultiLine ? "start" : "center"}
        onClick={(e) => {
          e.stopPropagation();
          onEditStart();
        }}
      >
        {children}
      </Flex>
    );
  }

  if (isMultiInput) {
    return (
      <Flex direction="column" width={fieldLength} gap="1">
        <TextField.Root
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onAddTag();
            } else if (e.key === "Escape") {
              onCancel();
            }
          }}
          autoFocus
          onBlur={onSave}
          size={fieldSize}
          data-testid={`edit-${fieldName}-input`}
        />
        {selected.length > 0 && (
          <Flex wrap="wrap" gap="1">
            {selected.map((val, index) => (
              <Flex
                key={index}
                pl="2"
                pr="1"
                align="center"
                gap="1"
                className={styles.selectedItem}
              >
                <Text size="1">{val}</Text>
                <X
                  size={14}
                  cursor="pointer"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onDeleteTag(index)}
                  data-testid={`edit-${fieldName}-delete-${index}-button`}
                />
              </Flex>
            ))}
          </Flex>
        )}
      </Flex>
    );
  }

  return isMultiLine ? (
    <TextArea
      defaultValue={value}
      autoFocus
      onChange={(e) => onChange(e.target.value)}
      onBlur={onSave}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      rows={3}
      size={fieldSize}
      style={{ width: fieldLength }}
      data-testid={`edit-${fieldName}-input`}
    />
  ) : (
    <TextField.Root
      type={type}
      defaultValue={value}
      autoFocus
      onChange={(e) => onChange(e.target.value)}
      onBlur={onSave}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
      size={fieldSize}
      style={{ width: fieldLength }}
      data-testid={`edit-${fieldName}-input`}
    />
  );
}
