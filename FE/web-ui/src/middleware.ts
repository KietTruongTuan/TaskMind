import { NextResponse, NextRequest } from "next/server";
import { WebUrl } from "./app/enum/web-url.enum";

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
    "/tm/workspace/goal/my-goals",
    "/tm/workspace/goal/:path*",
    "/tm/workspace/task/all-tasks",
    "/tm/workspace/knowledge-base",
  ];
  if (!refreshToken && protectedPaths.some((path) => {
    if (path.endsWith(":path*")) {
      const basePath = path.replace(":path*", "");
      return url.pathname.startsWith(basePath);
    }
    return url.pathname === path;
  })) {
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
    "/tm/workspace/goal/my-goals",
    "/tm/workspace/goal/:path*",
    "/tm/workspace/task/all-tasks",
    "/tm/workspace/knowledge-base",
  ],
};
