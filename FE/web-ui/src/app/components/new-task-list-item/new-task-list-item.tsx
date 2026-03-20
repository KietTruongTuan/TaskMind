import { DraftTask } from "@/app/constants";
import { Status } from "@/app/enum/status.enum";
import { Flex, Text } from "@radix-ui/themes";
import { Calendar } from "lucide-react";
import { useState, useRef } from "react";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { EditField } from "../edit-field/edit-field";
import { StatusDropDown } from "../status-dropdown/status-dropdown";
import styles from "./new-task-list-item.module.scss";

export function NewTaskListItem({
  onSave,
  onCancel,
}: {
  onSave: (task: DraftTask) => void;
  onCancel: () => void;
}) {
  const [detail, setDetail] = useState<DraftTask>({
    name: "",
    status: Status.ToDo,
    deadline: new Date(),
  });
  const [editingField, setEditingField] = useState<"name" | "deadline" | null>(
    "name",
  );

  const detailRef = useRef(detail);

  const handleSaveName = () => {
    if (detailRef.current.name.trim() === "") {
      onCancel();
      return;
    }
    setEditingField(null);
    onSave(detailRef.current);
  };

  return (
    <CardNoPadding py="2" px="3">
      <Flex width="100%" height="100%" justify="between" align="center" gap="2">
        <EditField
          iconSize={12}
          fieldName="new-task-name"
          fieldSize="1"
          fieldLength="50%"
          type="text"
          value={detail.name}
          isEditing={editingField === "name"}
          onEditStart={() => setEditingField("name")}
          onChange={(newValue) => {
            detailRef.current = { ...detailRef.current, name: newValue || "" };
          }}
          onSave={handleSaveName}
          onCancel={onCancel}
          isDetailCard
        >
          <Text>{detail.name || "New Task"}</Text>
        </EditField>

        <Flex gap="3" align="center">
          <StatusDropDown status={detail.status} isDropdown />
          <Flex gap="1" className={styles.subText}>
            <EditField
              iconSize={12}
              fieldName="new-task-deadline"
              fieldSize="1"
              type="date"
              value={detail.deadline.toISOString().split("T")[0]}
              isEditing={editingField === "deadline"}
              isDetailCard
            >
              <Calendar size={14} />
              <Text size="1">
                {detail.deadline.toISOString().split("T")[0]}
              </Text>
            </EditField>
          </Flex>
        </Flex>
      </Flex>
    </CardNoPadding>
  );
}
