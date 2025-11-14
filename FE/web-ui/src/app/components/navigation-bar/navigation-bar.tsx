"use client";
import { LogoIcon } from "@/app/components/logo-icon/logo-icon";
import { Box, Flex, Avatar, Text, Button } from "@radix-ui/themes";
import { Home, Plus, List } from "lucide-react";
import { CustomButton } from "../custom-button/custom-button";
import styles from "./navigation-bar.module.scss";
import { WebUrl } from "@/app/enum/web-url.enum";
import { usePathname, useRouter } from "next/navigation";
import { ThemeToggle } from "../theme-toggle/theme-toggle";
import { ButtonType } from "@/app/enum/button-type.enum";

interface navBarItem {
  icon: React.ElementType;
  label: string;
  url: WebUrl;
  testId: string;
}
export function NavigationBar({ userAvatar }: { userAvatar?: string }) {
  const currentUrl = usePathname();
  const route = useRouter();
  const navBarItems: navBarItem[] = [
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
      url: WebUrl.GoalBoard,
      testId: "manage-goal",
    },
    {
      icon: List,
      label: "All Tasks",
      url: WebUrl.TaskBoard,
      testId: "manage-goal",
    },
  ];
  return (
    <Flex
      width="100%"
      className={styles.navBar}
      p="3"
      justify="between"
      data-testid="navbar"
    >
      <Flex gap="2" align="center" ml={{ initial: "3", md: "0" }}>
        <Box>
          <LogoIcon size="20" />
        </Box>
        <Flex direction="column">
          <Text>AI Goal Manager</Text>
          <Text size="1" className={styles.subText}>
            Smart Goal Management System
          </Text>
        </Flex>
      </Flex>
      <Flex
        align="center"
        gap="7"
        display={{ initial: "none", md: "flex" }}
        data-testid="navbar-items"
      >
        {navBarItems.map((value, index) => {
          const isActive = currentUrl === value.url;
          const Icon = value.icon;

          return (
            <CustomButton
              key={index}
              variant="ghost"
              onClick={() => route.push(value.url)}
              buttonType={ButtonType.Tab}
              isActive={isActive}
              data-testid={`${value.testId}-tab`}
            >
              <Flex align="center" gap="2">
                <Icon size={16} />
                <Text weight="medium">{value.label}</Text>
              </Flex>
            </CustomButton>
          );
        })}
      </Flex>
      <Flex gap="3">
        <ThemeToggle />
        <Avatar
          mr={{ initial: "3", md: "0" }}
          className={styles.avatarBox}
          src={userAvatar}
          fallback="N"
        />
      </Flex>
    </Flex>
  );
}
