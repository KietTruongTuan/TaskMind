"use client";
import { Flex, Text } from "@radix-ui/themes";
import { CustomButton } from "../custom-button/custom-button";
import { WebUrl } from "@/app/enum/web-url.enum";
import { usePathname, useRouter } from "next/navigation";
import { Home, Kanban, List, LogOut, Plus } from "lucide-react";
import { ButtonType } from "@/app/enum/button-type.enum";
import { authenticationService } from "@/app/constants";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import styles from "./bar-items.module.scss";
import { AlertDialogPopUp } from "../alert-dialog-pop-up/alert-dialog-pop-up";

interface BarItem {
  icon: React.ElementType;
  label: string;
  url: WebUrl;
  testId: string;
}

export function BarItems({
  onItemClick,
  isSideItem,
}: {
  onItemClick?: () => void;
  isSideItem?: boolean;
}) {
  const currentUrl = usePathname();
  const { route } = useRouteLoadingContext();
  const navBarItems: BarItem[] = [
    {
      icon: Home,
      label: "Home",
      url: WebUrl.Dashboard,
      testId: "dashboard",
    },
    { icon: Plus, label: "New", url: WebUrl.GoalAdd, testId: "add-goal" },
    {
      icon: List,
      label: "My Goals",
      url: WebUrl.GoalList,
      testId: "goal-board",
    },
    {
      icon: Kanban,
      label: "All Tasks",
      url: WebUrl.TaskBoard,
      testId: "task-board",
    },
  ];

  return (
    <Flex direction="column" width="100%" height="100%" justify="between">
      <Flex direction="column" gap="5" width="100%">
        {navBarItems.map((value, index) => {
          const isActive = currentUrl === value.url;
          const Icon = value.icon;

          return (
            <CustomButton
              key={index}
              variant="ghost"
              onClick={() => {
                onItemClick?.();
                route(value.url);
              }}
              buttonType={ButtonType.Tab}
              isActive={isActive}
              style={{
                aspectRatio: "1 / 1",
              }}
              data-testid={`${value.testId}-tab`}
            >
              <Flex
                direction="column"
                align="center"
                gap="1"
                width={isSideItem ? "100%" : ""}
              >
                <Icon size={16} />
                <Text weight="medium" size="1">
                  {value.label}
                </Text>
              </Flex>
            </CustomButton>
          );
        })}
      </Flex>
    </Flex>
  );
}
