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

interface ToastContextProps {
  showToast: (msg: string) => void;
  setIsSuccess: Dispatch<SetStateAction<boolean>>;
}

const ToastContext = createContext<ToastContextProps | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setOpen(false);

    // re-trigger the toast animation
    setTimeout(() => setOpen(true), 10);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, setIsSuccess }}>
      <Toast.Provider swipeDirection="right">
        {children}

        <Toast.Root
          open={open}
          onOpenChange={setOpen}
          className={styles[isSuccess ? "toastSuccess" : "toastError"]}
        >
          <Flex align="center" px="4" py="3">
            <Toast.Title>
              <Text size="2" weight="regular">
                {message}
              </Text>
            </Toast.Title>
          </Flex>
        </Toast.Root>

        <Toast.Viewport className={styles.toastViewport} />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be inside ToastProvider");
  return context;
}
