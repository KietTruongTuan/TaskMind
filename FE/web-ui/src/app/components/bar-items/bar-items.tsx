"use client";
import { Flex, Text } from "@radix-ui/themes";
import { CustomButton } from "../custom-button/custom-button";
import { WebUrl } from "@/app/enum/web-url.enum";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Kanban, List, Plus } from "lucide-react";
import { ButtonType } from "@/app/enum/button-type.enum";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import styles from "./bar-items.module.scss";
import { AnimatePresence, motion } from "framer-motion";

interface BarItem {
  icon: React.ElementType;
  label: string;
  url: WebUrl;
  testId: string;
}

export function BarItems({
  onItemClick,
  isOpen,
}: {
  onItemClick?: () => void;
  isOpen?: boolean;
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
      testId: "my-goal",
    },
    {
      icon: Kanban,
      label: "All Tasks",
      url: WebUrl.TaskBoard,
      testId: "all-tasks",
    },
    {
      icon: BookOpen,
      label: "Knowledge Base",
      url: WebUrl.KnowledgeBase,
      testId: "knowledge-base",
    },
  ];

  return (
    <Flex direction="column" gap="4" width="100%" align="center">
      {navBarItems.map((value, index) => {
        const isActive = currentUrl === value.url;
        const Icon = value.icon;

        return (
          <CustomButton
            key={index}
            variant="ghost"
            style={
              !isOpen
                ? {
                    aspectRatio: "1 / 1",
                    height: "auto",
                    width: "100%",
                    cursor: "pointer",
                  }
                : {
                    width: "100%",
                    cursor: "pointer",
                  }
            }
            onClick={() => {
              onItemClick?.();
              route(value.url);
            }}
            buttonType={ButtonType.Tab}
            isActive={isActive}
            data-testid={`${value.testId}-tab`}
          >
            <Flex
              align="center"
              justify={isOpen ? "start" : "center"}
              gap="3"
              width="100%"
            >
              <Icon size={18} />
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: "auto" }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className={styles.itemMotion}
                  >
                    <Text weight="medium" size="2">
                      {value.label}
                    </Text>
                  </motion.div>
                )}
              </AnimatePresence>
            </Flex>
          </CustomButton>
        );
      })}
    </Flex>
  );
}
