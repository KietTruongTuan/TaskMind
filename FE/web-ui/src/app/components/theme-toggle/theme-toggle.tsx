"use client";
import { useThemeContext } from "@/app/contexts/theme-context/theme-context";
import { ThemeMode } from "@/app/enum/theme-mode.enum";
import { Flex } from "@radix-ui/themes";
import { Moon, Sun } from "lucide-react";
import styles from "./theme-toggle.module.scss";
import { AnimatePresence, motion } from "framer-motion";
export function ThemeToggle() {
  const { theme, setTheme } = useThemeContext();

  return (
    <Flex
      justify="center"
      align="center"
      className={styles.toggleButton}
      width="40px"
      height="40px"
      onClick={() =>
        setTheme(theme === ThemeMode.Dark ? ThemeMode.Light : ThemeMode.Dark)
      }
      data-testid="theme-toggle"
    >
      <AnimatePresence mode="wait" initial={false}>
        {theme === ThemeMode.Dark ? (
          <motion.span
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: -45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 45 }}
            transition={{ duration: 0.3 }}
          >
            <Moon data-testid="dark-icon" display="block" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ y: 20, opacity: 0, rotate: 45 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -45 }}
            transition={{ duration: 0.3 }}
          >
            <Sun data-testid="light-icon" display="block" />
          </motion.span>
        )}
      </AnimatePresence>
    </Flex>
  );
}
