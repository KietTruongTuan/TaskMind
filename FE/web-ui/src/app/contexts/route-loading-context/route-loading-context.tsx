"use client";
import { createContext, useContext, useTransition } from "react";
import { useRouter } from "next/navigation";

interface RouteLoadingContextType {
  isRouteLoading: boolean;
  route: (url: string) => void;
}

const RouteLoadingContext = createContext<RouteLoadingContextType>({
  isRouteLoading: false,
  route: () => {},
});

export const RouteLoadingProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const route = (url: string) => {
    startTransition(() => {
      router.push(url);
    });
  };

  return (
    <RouteLoadingContext.Provider
      value={{ isRouteLoading: isPending, route }}
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
