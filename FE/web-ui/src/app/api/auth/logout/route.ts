import { ApiUrl } from "@/app/enum/api-url.enum";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json(
      { error: "Backend URL not configured" },
      { status: 500 },
    );
  }

  const cookieHeader = request.headers.get("cookie") ?? "";

  await fetch(`${BACKEND_URL}${ApiUrl.LogOut}`, {
    method: "POST",
    headers: { Cookie: cookieHeader },
  });

  const response = NextResponse.json(
    { message: "Logged out" },
    { status: 200 },
  );

  response.cookies.delete("refresh_token");

  return response;
}
