import { cookies } from "next/headers";
import {
  aiService,
  authenticationService,
  goalService,
  taskService,
} from "@/app/constants";

const REFRESH_COOKIE_NAME = "refresh_token";
export async function useServerSideService() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_COOKIE_NAME)?.value;

  authenticationService["refreshInstance"].defaults.headers.common["Cookie"] =
    `${REFRESH_COOKIE_NAME}=${refreshToken}`;

  authenticationService["refreshInstance"].defaults.headers.common[
    "X-Server-Side"
  ] = "true";

  const res = await authenticationService.refresh();

  const accessToken = res.data.access;

  if (accessToken) {
    goalService.setAccessToken(accessToken);
    aiService.setAccessToken(accessToken);
    taskService.setAccessToken(accessToken);
  }

  return { goalService, aiService, taskService, accessToken };
}
