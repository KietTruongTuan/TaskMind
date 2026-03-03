import { cookies } from "next/headers";
import { aiService, authenticationService, goalService } from "@/app/constants";

const REFRESH_COOKIE_NAME = "refresh_token";
export async function useServerSideService() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  authenticationService["refreshInstance"].defaults.headers.common["Cookie"] =
    `${REFRESH_COOKIE_NAME}=${refreshToken}`;

  const res = await authenticationService.refresh({ noRotation: true });
  const accessToken = res.data.access;

  if (accessToken) {
    goalService.setAccessToken(accessToken);
    aiService.setAccessToken(accessToken);
  }

  return { goalService, aiService, accessToken };
}
