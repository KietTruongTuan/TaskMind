"use client";
import { authenticationService } from "@/app/constants";
import { createContext, useContext, useEffect, useState } from "react";

const TokenRefresherContext = createContext<{
  accessToken: string | null;
  loading: boolean;
} | null>(null);

export function TokenRefresherProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await authenticationService.refresh();
        const access = res.data.access;
        if (access) {
          authenticationService.setAccessToken(access);
          setAccessToken(access);
        }
      } catch {
        authenticationService.logout();
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  return (
    <TokenRefresherContext.Provider value={{ accessToken, loading }}>
      {children}
    </TokenRefresherContext.Provider>
  );
}

export function useTokenRefresherContext() {
  const context = useContext(TokenRefresherContext);
  if (!context)
    throw new Error(
      "useTokenRefresherContext must be used inside TokenRefresherProvider"
    );
  return context;
}
