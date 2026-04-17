"use client";
import { Flex, Text } from "@radix-ui/themes";
import { ReactNode } from "react";

export function LoadingText({text, textSize, specialEffectComponent}: {text?: string, textSize?: "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9", specialEffectComponent?: ReactNode}) {
  return (
    <Flex align="end">
      {text && <Text size={textSize} style={{ fontStyle: "italic" }}>{text}</Text>}
      {specialEffectComponent}
    </Flex>
  );
};