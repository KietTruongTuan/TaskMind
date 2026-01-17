"use client";

import { Dialog, Spinner, Flex } from "@radix-ui/themes";
import styles from "./loading-overlay.module.scss";
import { useRouteLoadingContext } from "@/app/contexts/route-loading-context/route-loading-context";

export function LoadingOverlay({ isLoading }: { isLoading?: boolean }) {
  const { isRouteLoading } = useRouteLoadingContext();

  return (
    <Dialog.Root open={isLoading || isRouteLoading}>
      <Dialog.Content className={styles.overlayContent}>
        <Dialog.Title></Dialog.Title>
        <Flex align="center" justify="center">
          <Spinner size="3" />
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
