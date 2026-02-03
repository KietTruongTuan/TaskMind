import { NextResponse, NextRequest } from "next/server";
import { WebUrl } from "./app/enum/web-url.enum";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;
  const url = request.nextUrl.clone();
  const entryPaths = ["/", "/tm", "/tm/workspace", WebUrl.Authentication];

  if (refreshToken && entryPaths.some((path) => url.pathname === path)) {
    return NextResponse.redirect(new URL(WebUrl.Dashboard, request.url));
  }

  const protectedPaths = [
    "/",
    "/tm",
    "/tm/workspace",
    "/tm/workspace/dashboard",
    "/tm/workspace/goal/add",
    "/tm/workspace/goal/board",
    "/tm/workspace/task/board",
  ];
  if (!refreshToken && protectedPaths.some((path) => url.pathname === path)) {
    return NextResponse.redirect(new URL(WebUrl.Authentication, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/tm",
    "/tm/workspace",
    "/tm/authentication",
    "/tm/workspace/dashboard",
    "/tm/workspace/goal/add",
    "/tm/workspace/goal/board",
    "/tm/workspace/task/board",
  ],
};
