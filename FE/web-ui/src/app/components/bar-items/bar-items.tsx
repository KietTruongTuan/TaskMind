import { Flex, Text } from "@radix-ui/themes";
import { CustomButton } from "../custom-button/custom-button";
import { WebUrl } from "@/app/enum/web-url.enum";
import { usePathname } from "next/navigation";
import { Home, Kanban, List, Plus } from "lucide-react";
import { ButtonType } from "@/app/enum/button-type.enum";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";

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
      label: "Dashboard",
      url: WebUrl.Dashboard,
      testId: "dashboard",
    },
    { icon: Plus, label: "New Goal", url: WebUrl.GoalAdd, testId: "add-goal" },
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
    <>
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
            data-testid={`${value.testId}-tab`}
          >
            <Flex align="center" gap="2" width={isSideItem ? "100%" : ""}>
              <Icon size={16} />
              <Text weight="medium">{value.label}</Text>
            </Flex>
          </CustomButton>
        );
      })}
    </>
  );
}
