"use client";
import { useTokenRefresherContext } from "@/app/contexts/token-refresher-context/token-refresher-context";
import  { jwtDecode } from "jwt-decode";

interface UserPayload {
  user_id: string;
  username: string;
  email: string;
}

export function TokenRefresher() {
  const {accessToken, loading} = useTokenRefresherContext();

  if (loading || !accessToken) {
    return <div>Loading...</div>;
  }

  const user = jwtDecode<UserPayload>(accessToken);

  return <div>User name: {user.username}</div>;
}
