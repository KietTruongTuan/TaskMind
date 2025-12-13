"use client";
import { authenticationService, UserPayload } from "@/app/constants";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

const TokenRefresherContext = createContext<{
  user?: UserPayload;
  loading: boolean;
} | null>(null);

export function TokenRefresherProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserPayload>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      try {
        const res = await authenticationService.refresh();
        const access = res.data.access;
        if (access) {
          authenticationService.setAccessToken(access);
          const user = jwtDecode<UserPayload>(access);
          setUser(user);
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
    <TokenRefresherContext.Provider value={{ user, loading }}>
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
