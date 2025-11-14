import { NextResponse, NextRequest } from "next/server";
import { authenticationService } from "./app/constants";

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  const response = NextResponse.next();
  try {
    // Call backend to refresh access token
    console.log(request.cookies.get("refresh_token")?.value);
    await authenticationService.refresh(request.cookies.get("refresh_token")?.value);
    return response;
  } catch (error) {
    authenticationService.logout();
    return NextResponse.redirect(new URL("/tm/authentication", request.url));
  }
}

export const config = {
  matcher: ["/tm/workspace/dashboard"],
};
