import { NextRequest, NextResponse } from "next/server";
import { getRemainingCount, getTodayCST } from "@/lib/chatRateLimit";

function getIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
}

export async function GET(request: NextRequest) {
  try {
    const ip = getIP(request);
    const sessionId = request.cookies.get("chat_session")?.value || "";
    const date = getTodayCST();
    const result = await getRemainingCount(ip, sessionId, date);
    return NextResponse.json(result);
  } catch (error) {
    console.error("GET /api/chat/status error:", error);
    return NextResponse.json({ remaining: 10, globalExhausted: false });
  }
}
