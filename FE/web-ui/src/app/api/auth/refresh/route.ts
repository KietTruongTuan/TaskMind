import { ApiUrl } from "@/app/enum/api-url.enum";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(request: NextRequest) {
  if (!BACKEND_URL) {
    return NextResponse.json({ error: "Backend URL not configured" }, { status: 500 });
  }

  const bodyText = await request.text();
  const targetUrl = new URL(`${BACKEND_URL}${ApiUrl.RefreshToken}`);
  const cookieHeader = request.headers.get("cookie") ?? "";

  try {
    const res = await fetch(targetUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: bodyText || JSON.stringify({}),
    });

    const data = await res.json();
    const response = NextResponse.json(data, { status: res.status });

    const setCookies = res.headers.getSetCookie();
    for (const cookie of setCookies) {
      response.headers.append("set-cookie", cookie);
    }

    return response;

  } catch (error) {
  
    console.error("Next.js API Route failed to reach Django:", error);
    return NextResponse.json(
      { error: "Failed to connect to backend." },
      { status: 502 } 
    );
  }
}