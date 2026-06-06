"use client";

import * as Toast from "@radix-ui/react-toast";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useState,
} from "react";
import styles from "./toast-context.module.scss";
import { Flex, Text } from "@radix-ui/themes";
import { ToastType } from "@/app/enum/toast-type.enum";

interface ToastContextProps {
  showToast: (msg: React.ReactNode, duration?: number, isRightAligned?: boolean) => void;
  hideToast: () => void;
  setToastType: Dispatch<SetStateAction<ToastType>>;
}

const ToastContext = createContext<ToastContextProps | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState<React.ReactNode>("");
  const [toastType, setToastType] = useState<ToastType>(ToastType.Success);
  const [isRightAligned, setIsRightAligned] = useState<boolean>(true);
  const [duration, setDuration] = useState<number | undefined>(undefined);

  const showToast = useCallback(
    (msg: React.ReactNode, customDuration?: number, isRightAligned?: boolean) => {
      setMessage(msg);
      setDuration(customDuration);
      setOpen(false);
      setIsRightAligned(isRightAligned ?? true);
      // re-trigger the toast animation
      setTimeout(() => setOpen(true), 10);
    },
    [],
  );

  const hideToast = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast, setToastType }}>
      <Toast.Provider swipeDirection={isRightAligned ? "right" : "left"}>
        {children}

        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className={styles[toastType]}
          duration={duration}
        >
          <Flex align="center" px="4" py="3">
            <Toast.Title>
              <Text size="2" weight="regular">
                {message}
              </Text>
            </Toast.Title>
          </Flex>
        </Toast.Root>

        <Toast.Viewport className={isRightAligned ? styles.toastViewportRight : styles.toastViewportLeft} />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be inside ToastProvider");
  return context;
}
