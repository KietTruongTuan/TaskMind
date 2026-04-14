"use client";
import { Flex } from "@radix-ui/themes";
import { BarItems } from "../bar-items/bar-items";
import styles from "./side-bar.module.scss";
import { Menu } from "lucide-react";
import { motion } from "framer-motion";
import { useSidebarContext } from "@/app/contexts/sidebar-context/sidebar-context";

export function SideBar() {
  const { isOpen, setIsOpen } = useSidebarContext();

  return (
    <motion.div
      animate={{ width: isOpen ? "14vw" : "4vw" }}
      style={{ minWidth: isOpen ? "14vw" : "4vw" }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 30,
      }}
      className={styles.sideBarMotion}
    >
      <Flex
        direction="column"
        height="100%"
        align="center"
        width="100%"
        p="4"
        className={styles.sideBar}
      >
        <Flex
          direction="column"
          align="start"
          justify="center"
          gap="8"
          width="100%"
        >
          <Menu
            cursor="pointer"
            onClick={() => setIsOpen(!isOpen)}
            data-testid="side-bar-open-button"
          />
          <BarItems isOpen={isOpen} />
        </Flex>
      </Flex>
    </motion.div>
  );
}
