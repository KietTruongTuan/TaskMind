import * as Dialog from "@radix-ui/react-dialog";
import { Box, Flex, Text, Theme } from "@radix-ui/themes";
import { Menu, PanelLeft } from "lucide-react";
import styles from "./side-bar-dialog.module.scss";
import { useThemeContext } from "@/app/contexts/theme-context/theme-context";
import { BarItems } from "../bar-items/bar-items";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogoIcon } from "../logo-icon/logo-icon";

export function SideBarDialog() {
  const { theme } = useThemeContext();
  const [open, setOpen] = useState(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Menu size={30} data-testid="sidebar-button" />
      </Dialog.Trigger>

      <Dialog.Portal forceMount>
        <AnimatePresence>
          {open && (
            <>
              <Dialog.Overlay>
                <motion.div
                  className={styles.dialogOverlay}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              </Dialog.Overlay>
              <Theme appearance={theme}>
                <Dialog.Content
                  className={styles.dialogContent}
                  onInteractOutside={(e) => e.preventDefault()}
                  onEscapeKeyDown={(e) => e.preventDefault()}
                >
                  <motion.div
                    className={styles.dialogContent}
                    initial={{ x: "-100%" }}
                    animate={{ x: 0 }}
                    exit={{ x: "-100%" }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Flex
                      gap="2"
                      direction="column"
                      align="center"
                      width="100%"
                      p="4"
                    >
                      <Flex width="100%" justify="end">
                        <Dialog.Close asChild>
                          <PanelLeft cursor="pointer" />
                        </Dialog.Close>
                      </Flex>
                      <Box>
                        <LogoIcon size="25" />
                      </Box>
                      <Flex direction="column" justify="center" align="center">
                        <Text>AI Goal Manager</Text>
                        <Text size="1" className={styles.subText}>
                          Smart Goal Management System
                        </Text>
                      </Flex>

                      <Flex direction="column" gap="4" mt="4" width="100%">
                        <BarItems
                          onItemClick={() => setOpen(false)}
                          isSideItem
                        />
                      </Flex>
                    </Flex>
                  </motion.div>
                </Dialog.Content>
              </Theme>
            </>
          )}
        </AnimatePresence>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
