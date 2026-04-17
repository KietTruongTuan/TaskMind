"use client";
import { Dot } from "lucide-react";
import { Flex } from "@radix-ui/themes";
import { ReactNode, useEffect, useState } from "react";

export function ThreeDotLoading() {
  const [dots, setDots] = useState<ReactNode[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? [] : [...prev, <Dot key={prev.length} viewBox="8 8 8 8" size={5}/>]));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <Flex gap="1" pb="1">{dots}</Flex>
  );
}