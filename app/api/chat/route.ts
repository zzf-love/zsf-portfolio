import { NextRequest, NextResponse } from "next/server";
import { CHAT_SYSTEM_PROMPT } from "@/lib/chatPrompt";
import {
  checkAndIncrement,
  incrementTokenUsage,
  getTodayCST,
} from "@/lib/chatRateLimit";

function getIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";
  return ip;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const message: string = (body.message || "").trim();

    if (!message) {
      return NextResponse.json({ error: "EMPTY_MESSAGE" }, { status: 400 });
    }

    const ip = getIP(request);
    const sessionId = request.cookies.get("chat_session")?.value || "";
    const date = getTodayCST();

    // 检查限速
    const limitResult = await checkAndIncrement(ip, sessionId, date);
    if (!limitResult.allowed) {
      const res = NextResponse.json(
        {
          error: limitResult.reason === "global_token_limit" ? "QUOTA_EXCEEDED" : "LIMIT_EXCEEDED",
          remaining: 0,
          reply:
            limitResult.reason === "global_token_limit"
              ? "系统今日 AI 额度已用完，明天再来吧。您也可以前往 About Me 页面了解更多关于我的信息。"
              : "今日对话次数已用完，您可以前往 About Me 页面了解更多关于我的信息。",
        },
        { status: 429 }
      );
      return res;
    }

    // 调用 DeepSeek
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
    }

    const deepseekRes = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.DEEPSEEK_MODEL || "deepseek-chat",
        max_tokens: 300,
        temperature: 0.7,
        messages: [
          { role: "system", content: CHAT_SYSTEM_PROMPT },
          { role: "user", content: message },
        ],
      }),
    });

    if (!deepseekRes.ok) {
      console.error("DeepSeek error:", await deepseekRes.text());
      return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
    }

    const data = await deepseekRes.json();
    const reply: string = data.choices?.[0]?.message?.content || "";
    const usedTokens: number =
      (data.usage?.prompt_tokens || 0) + (data.usage?.completion_tokens || 0);

    // 更新全局 token 用量
    await incrementTokenUsage(date, usedTokens);

    // 设置 session cookie（如未设置）
    const newSessionId = sessionId || crypto.randomUUID();
    const response = NextResponse.json({ reply, remaining: limitResult.remaining });

    if (!sessionId) {
      response.cookies.set("chat_session", newSessionId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
        sameSite: "lax",
      });
    }

    return response;
  } catch (error) {
    console.error("POST /api/chat error:", error);
    return NextResponse.json({ error: "SERVER_ERROR" }, { status: 500 });
  }
}
