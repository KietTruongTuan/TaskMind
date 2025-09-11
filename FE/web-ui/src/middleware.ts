import { NextResponse, NextRequest } from "next/server";

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  return NextResponse.redirect(new URL("/tm/authentication", request.url));
}

export const config = {
  matcher: ["/", "/tm"],
};
