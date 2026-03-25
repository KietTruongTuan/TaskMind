"use client";
import { CardNoPadding } from "../card-no-padding/card-no-padding";
import { Fragment, useRef, useState } from "react";
import { Flex, Progress, Text } from "@radix-ui/themes";

import { Calendar, CheckCircle, Clock, Trash2, TrendingUp } from "lucide-react";
import { GoalCardPropsData } from "@/app/tm/workspace/dashboard/components/recent-goal-list/recent-goal-list";
import { StatusDropDown } from "../status-dropdown/status-dropdown";
import { StatusCard, StatusCardProps } from "../status-card/status-card";

import {
  ApiError,
  CreateGoalResponseBody,
  DraftGoalRequestBody,
  GoalResponseBody,
  goalService,
} from "@/app/constants";
import { useToast } from "@/app/contexts/toast-context/toast-context";
import styles from "./goal-card.module.scss";
import { EditField } from "../edit-field/edit-field";
import { AlertDialogPopUp } from "../alert-dialog-pop-up/alert-dialog-pop-up";
import { WebUrl } from "@/app/enum/web-url.enum";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import { useGoalContext } from "@/app/contexts/goal-context/goal-context";
import { buildUrl } from "@/app/tm/utils";

export function GoalCard({
  id,
  name,
  status,
  description,
  tag,
  completedCount,
  taskCount,
  deadline: rawDeadline,
  isDetailCard = false,
  isPrimary = false,
  isDraft = false,
}: GoalCardPropsData) {
  const deadline = new Date(rawDeadline);
  const initialDetail: GoalResponseBody = {
    name,
    status,
    description,
    tag,
    deadline,
    completedCount,
    taskCount,
  };
  const [editingField, setEditingField] = useState<
    keyof DraftGoalRequestBody | null
  >(null);
  const [detail, setDetail] = useState<GoalResponseBody>(initialDetail);
  const { route, setIsRouteLoading } = useRouteLoadingContext();
  const { draftGoal, setDraftGoal } = useGoalContext();
  const detailRef = useRef<GoalResponseBody>(initialDetail);
  const currentDate: Date = new Date();

  const progress: number = Math.round(
    taskCount === 0 ? 0 : (completedCount * 100) / taskCount,
  );
  const { showToast, setIsSuccess } = useToast();
  const cardContent: StatusCardProps[] = [
    {
      label: "Progress",
      value: `${progress}%`,
      icon: <TrendingUp size="30" className={styles.inProgress} />,
    },
    {
      label: "Completed",
      value: `${completedCount}/${taskCount}`,
      icon: <CheckCircle size="30" className={styles.completed} />,
    },
    {
      label: "Deadline",
      value: (
        <EditField
          fieldName="goal-deadline"
          iconSize={14}
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
          isDetailCard={isDetailCard}
        >
          {detail.deadline.toISOString().split("T")[0]}
        </EditField>
      ),
      icon: <Calendar size="30" className={styles.cancel} />,
    },
    {
      label: "Estimated time remaining",
      value: `${Math.ceil(
        (detail.deadline.getTime() - currentDate.getTime()) /
          (1000 * 60 * 60 * 24),
      )} days`,
      icon: <Clock size="30" className={styles.onHold} />,
    },
  ];

  const handleUpdate = async (field: keyof GoalResponseBody) => {
    const newValue =
      detailRef.current[field] instanceof Date
        ? detailRef.current[field].toISOString().split("T")[0]
        : detailRef.current[field];
    const originalValue = initialDetail[field];

    if (newValue === originalValue) {
      setEditingField(null);
      return;
    }

    const updateData: DraftGoalRequestBody = { [field]: newValue };
    setDetail(detailRef.current);
    setEditingField(null);

    try {
      if (id) {
        await goalService.update(id, updateData);
        setEditingField(null);
      } else {
        setDraftGoal({ ...draftGoal, ...updateData } as CreateGoalResponseBody);
      }
    } catch (error) {
      setIsSuccess(false);
      showToast(`Failed to update ${field}`);
      setDetail({ ...detail, [field]: originalValue });
      setEditingField(null);
    }
  };

  const handleDelete = async () => {
    if (id) {
      setIsRouteLoading(true);
      try {
        await goalService.remove(id);
        route(WebUrl.GoalList);
      } catch (err) {
        setIsSuccess(false);
        const error = err as ApiError;
        showToast(error.message);
      } finally {
        setIsRouteLoading(false);
      }
    }
  };

  return (
    <>
      <CardNoPadding
        px={isDetailCard ? "5" : "3"}
        pt={isDetailCard ? "5" : "2"}
        pb={isDetailCard ? "5" : "1"}
        isPrimary={isPrimary}
      >
        <Flex direction="column" width="100%" height="100%" gap="4">
          <Flex width="100%" height="100%" justify="between" gap="2">
            <Flex direction="column" width="100%" height="100%" gap="2">
              <Flex
                width="100%"
                height="100%"
                direction="column"
                gap={isDetailCard ? "2" : "1"}
              >
                <EditField
                  iconSize={14}
                  fieldName="goal-name"
                  fieldSize="2"
                  fieldLength="50%"
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
                  isDetailCard={isDetailCard}
                >
                  <Text
                    size={isDetailCard ? "6" : "2"}
                    weight="regular"
                    onClick={() => {
                      if (id) {
                        route(buildUrl(WebUrl.GoalDetail, id, undefined));
                      }
                    }}
                    className={styles.routeText}
                  >
                    {detail.name}
                  </Text>
                </EditField>

                <Flex justify="between" className={styles.subText}>
                  <Flex gap="4" align="start">
                    <EditField
                      iconSize={14}
                      fieldSize="1"
                      type="text"
                      fieldName="goal-tag"
                      isMultiInput
                      value={(detail.tag || []).join(", ")}
                      isEditing={editingField === "tag"}
                      onEditStart={() => setEditingField("tag")}
                      onChange={(newValue) => {
                        const tags = Array.isArray(newValue)
                          ? newValue
                          : (newValue || "")
                              .toString()
                              .split(",")
                              .map((s) => s.trim())
                              .filter(Boolean);
                        detailRef.current = {
                          ...detailRef.current,
                          tag: tags,
                        };
                      }}
                      onSave={() => handleUpdate("tag")}
                      onCancel={() => {
                        setDetail(initialDetail);
                        setEditingField(null);
                      }}
                      isDetailCard={isDetailCard}
                    >
                      <Flex gap="2" align="center">
                        {(detail.tag || []).map((value, index) => (
                          <Fragment key={index}>
                            {index > 0 && (
                              <Text
                                size={isDetailCard ? "2" : "1"}
                                weight="bold"
                              >
                                {" "}
                                ·{" "}
                              </Text>
                            )}
                            <Text size={isDetailCard ? "2" : "1"}>{value}</Text>
                          </Fragment>
                        ))}
                      </Flex>
                    </EditField>
                    {detail.status && (
                      <Flex mt={isDetailCard ? "1" : "0"}>
                        <StatusDropDown
                          status={detail.status}
                          onStatusChange={(newValue) => {
                            detailRef.current = {
                              ...detailRef.current,
                              status: newValue,
                            };
                            setDetail(detailRef.current);
                            handleUpdate("status");
                          }}
                          isDropdown={isDetailCard}
                        />
                      </Flex>
                    )}
                  </Flex>
                  {!isDetailCard && (
                    <Text size="1">{deadline.toISOString().split("T")[0]}</Text>
                  )}
                </Flex>
                {!isDetailCard && (
                  <Flex direction="column" gap="1">
                    <Progress value={progress} size="2" highContrast mt="1" />
                    <Flex justify="end">
                      <Text
                        size="1"
                        className={styles.subText}
                      >{`${progress}%`}</Text>
                    </Flex>
                  </Flex>
                )}
              </Flex>
              {description && isDetailCard && (
                <EditField
                  iconSize={14}
                  fieldName="goal-description"
                  fieldSize="2"
                  fieldLength="50%"
                  type="text"
                  value={detail.description}
                  isEditing={editingField === "description"}
                  onEditStart={() => setEditingField("description")}
                  onChange={(newValue) => {
                    if (!newValue) return;
                    detailRef.current = {
                      ...detailRef.current,
                      description: newValue,
                    };
                  }}
                  onSave={() => handleUpdate("description")}
                  onCancel={() => {
                    setDetail(initialDetail);
                    setEditingField(null);
                  }}
                  isMultiLine
                  isDetailCard={isDetailCard}
                >
                  <Text size="2" className={styles.subText}>
                    {detail.description}
                  </Text>
                </EditField>
              )}
            </Flex>
            {isDetailCard && !isDraft && (
              <AlertDialogPopUp
                title="Are you sure"
                description="This action will delete your goal permanently"
                actionText="Delete"
                action={handleDelete}
              >
                <Trash2
                  size={16}
                  cursor="pointer"
                  className={styles.overdue}
                  data-testid="delete-goal-button"
                />
              </AlertDialogPopUp>
            )}
          </Flex>
          {isDetailCard && (
            <Flex align="stretch" gap="3">
              {cardContent.map((value, index) => (
                <StatusCard key={index} {...value} />
              ))}
            </Flex>
          )}
        </Flex>
      </CardNoPadding>
  );
}
