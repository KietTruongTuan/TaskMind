"use client";
import { createContext, useContext, useTransition, useState } from "react";
import { useRouter } from "next/navigation";

interface RouteLoadingContextType {
  isRouteLoading: boolean;
  setIsRouteLoading: (loading: boolean) => void;
  route: (url: string) => void;
}

const RouteLoadingContext = createContext<RouteLoadingContextType | null>(null);

export const RouteLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isManualLoading, setIsManualLoading] = useState(false);

  const route = (url: string) => {
    startTransition(() => {
      router.push(url);
    });
  };

  const isRouteLoading = isPending || isManualLoading;

  return (
    <RouteLoadingContext.Provider
      value={{ isRouteLoading, setIsRouteLoading: setIsManualLoading, route }}
    >
      {children}
    </RouteLoadingContext.Provider>
  );
};

export function useRouteLoadingContext() {
  const context = useContext(RouteLoadingContext);
  if (!context) throw new Error("useRouteLoadingContext must be inside RouteLoadingProvider");
  return context;
}
