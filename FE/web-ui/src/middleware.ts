import { NextResponse, NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.redirect(new URL("/tm/authentication", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/tm",
    "/tm/workspace",
    "/tm/workspace/dashboard",
    "/tm/workspace/goal/add",
  ],
};
