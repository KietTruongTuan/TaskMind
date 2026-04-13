"use client";
import { LogoIcon } from "@/app/components/logo-icon/logo-icon";
import { Flex, Text } from "@radix-ui/themes";
import styles from "./navigation-bar.module.scss";
import { ThemeToggle } from "../theme-toggle/theme-toggle";
import { AvatarMenu } from "../avatar-menu/avatar-menu";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";
import { WebUrl } from "@/app/enum/web-url.enum";
import { useSidebarContext } from "@/app/contexts/sidebar-context/sidebar-context";

export function NavigationBar() {
  const { route } = useRouteLoadingContext();
  const { isOpen: isSidebarOpen } = useSidebarContext();
  
  return (
    <Flex
      width="100%"
      maxWidth={isSidebarOpen ? "calc(100vw - 14vw)" : "calc(100vw - 4vw)"}
      className={styles.navBar}
      py="2"
      px="3"
      justify="between"
      position="sticky"
      data-testid="navbar"
    >
      <Flex
        gap="2"
        align="center"
        onClick={() => route(WebUrl.Dashboard)}
        style={{ cursor: "pointer" }}
      >
        <LogoIcon size="23" />
        <Text weight="medium" size="2">
          AI Goal Manager
        </Text>
      </Flex>
      <Flex gap="3">
        <ThemeToggle />
        <AvatarMenu />
      </Flex>
    </Flex>
  );
}
