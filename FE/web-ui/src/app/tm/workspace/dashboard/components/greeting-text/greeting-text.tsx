"use client";
import { Header } from "@/app/components/header/header";
import { SkeletonLoading } from "@/app/components/skeleton-loading/skeleton-loading";
import { useTokenRefresherContext } from "@/app/contexts/token-refresher-context/token-refresher-context";
import { Box } from "@radix-ui/themes";

export function GreetingText() {
  const { user, loading } = useTokenRefresherContext();
  return (
    <Box>
      <Header
        text={`Hi, ${user ? user.username : ""}!`}
        subText="Today is a wonderful day to achieve your goals."
        textSize="7"
        subTextSize="2"
        isLoading={loading}
      />
    </Box>
  );
}
