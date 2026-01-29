"use client";
import { LogoIcon } from "@/app/components/logo-icon/logo-icon";
import { Box, Flex, Text } from "@radix-ui/themes";
import styles from "./navigation-bar.module.scss";
import { ThemeToggle } from "../theme-toggle/theme-toggle";
import { BarItems } from "../bar-items/bar-items";
import { SideBarDialog } from "../side-bar-dialog/side-bar-dialog";
import { AvatarMenu } from "../avatar-menu/avatar-menu";

export function NavigationBar() {
  return (
    <Flex
      width="100%"
      className={styles.navBar}
      py="2"
      px="3"
      justify="between"
      position="fixed"
      data-testid="navbar"
    >
      <Flex gap="2" align="center">
        {/* <SideBarDialog /> */}
        <LogoIcon size="23" />
        <Text weight="medium" size="2">
          AI Goal Manager
        </Text>
      </Flex>
      {/* <Flex
        align="center"
        gap="7"
        display={{ initial: "none", md: "flex" }}
        data-testid="navbar-items"
      >
        <BarItems />
      </Flex> */}
      <Flex gap="3">
        <ThemeToggle />
        <AvatarMenu />
      </Flex>
    </Flex>
  );
}
