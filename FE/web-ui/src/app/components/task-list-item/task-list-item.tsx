import { Flex, Text } from "@radix-ui/themes";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { Status } from "@/app/enum/status.enum";
import { StatusDropDown } from "../status-dropdown/status-dropdown";
import { Calendar } from "lucide-react";
import styles from "./task-list-item.module.scss";
import {
  CreateGoalResponseBody,
  DraftTask,
  DraftTaskRequestBody,
  taskService,
} from "@/app/constants";
import { useRef, useState } from "react";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import { EditField } from "../edit-field/edit-field";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { useRouter } from "next/navigation";
import { Dispatch, SetStateAction } from "react";
import { Task } from "@/app/constants";

export function TaskListItem({
  task,
  onTaskStatusChange,
  index,
  setTasksLocal,
}: {
  task: DraftTask;
  onTaskStatusChange?: (oldStatus: Status, newStatus: Status) => void;
  setTasksLocal?: Dispatch<SetStateAction<Task[] | DraftTask[] | undefined>>;
  index?: number;
}) {
  const { draftGoal, setDraftGoal } = useGoalContext();
  const initialDetail: DraftTask = {
    ...task,
    deadline: new Date(task.deadline),
  };
  const [editingField, setEditingField] = useState<
    keyof DraftTaskRequestBody | null
  >(null);
  const [detail, setDetail] = useState<DraftTask>(initialDetail);
  const detailRef = useRef<DraftTask>(initialDetail);
  const isCompleted = detail.status === Status.Completed;
  const { showToast, setIsSuccess } = useToast();
  const router = useRouter();

  const handleUpdate = async (field: keyof DraftTask) => {
    const newValue =
      detailRef.current[field] instanceof Date
        ? detailRef.current[field].toISOString().split("T")[0]
        : detailRef.current[field];
    const originalValue = initialDetail[field];

    if (newValue === originalValue) {
      setEditingField(null);
      return;
    }

    const updateData: DraftTaskRequestBody = { [field]: newValue };

    setDetail(detailRef.current);

    setEditingField(null);

    try {
      if (task.id) {
        await taskService.update(task.id, updateData);
        if (setTasksLocal) {
          setTasksLocal((prev) =>
            prev?.map((t) =>
              (t as Task).id === task.id ? { ...t, ...updateData } : t,
            ),
          );
        }
        router.refresh();
        setEditingField(null);
      } else {
        setDraftGoal({
          ...draftGoal,
          tasks: draftGoal?.tasks?.map((t) =>
            t.index === index ? { ...t, ...updateData } : t,
          ),
        } as CreateGoalResponseBody);
      }
    } catch (error) {
      setIsSuccess(false);
      showToast(`Failed to update ${field}`);
      setDetail({ ...detail, [field]: originalValue });
      setEditingField(null);
    }
  };
  return (
    <CardNoPadding py="2" px="3">
      <Flex width="100%" height="100%" justify="between" align="center" gap="2">
        <EditField
          iconSize={12}
          fieldName="task-name"
          fieldSize="1"
          fieldLength="80%"
          type="text"
          value={detail.name}
          isEditing={editingField === "name"}
          onEditStart={() => setEditingField("name")}
          onChange={(newValue) => {
            if (!newValue) return;
            detailRef.current = {
              ...detailRef.current,
              name: newValue,
            };
          }}
          onSave={() => handleUpdate("name")}
          onCancel={() => {
            setDetail(initialDetail);
            setEditingField(null);
          }}
          isDetailCard
        >
          <Text
            style={{
              textDecoration: isCompleted ? "line-through" : "",
            }}
            size="1"
            className={isCompleted ? styles.subText : ""}
          >
            {detail.name}
          </Text>
        </EditField>

        <Flex gap="3" align="center">
          <StatusDropDown
            status={detail.status}
            onStatusChange={async (newValue) => {
              const oldStatus = detail.status;
              detailRef.current = {
                ...detailRef.current,
                status: newValue,
              };
              setDetail(detailRef.current);

              if (onTaskStatusChange) {
                onTaskStatusChange(oldStatus, newValue);
              }
              try {
                await handleUpdate("status");
              } catch (error) {
                if (onTaskStatusChange) {
                  onTaskStatusChange(newValue, oldStatus);
                }
              }
            }}
            isDropdown
          />
          <Flex gap="1" className={styles.subText}>
            <EditField
              iconSize={12}
              fieldName="task-deadline"
              fieldSize="1"
              type="date"
              value={detail.deadline.toISOString().split("T")[0]}
              isEditing={editingField === "deadline"}
              onEditStart={() => setEditingField("deadline")}
              onChange={(newValue) => {
                if (!newValue) return;
                detailRef.current = {
                  ...detailRef.current,
                  deadline: new Date(newValue),
                };
              }}
              onSave={() => handleUpdate("deadline")}
              onCancel={() => {
                setDetail(initialDetail);
                setEditingField(null);
              }}
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
