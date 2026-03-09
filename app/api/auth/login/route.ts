import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { signToken, COOKIE_NAME_EXPORT } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (!password) {
      return NextResponse.json({ error: "密码不能为空" }, { status: 400 });
    }

    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error("ADMIN_PASSWORD environment variable not set");
      return NextResponse.json({ error: "服务器配置错误" }, { status: 500 });
    }

    // Support both plain text and bcrypt hash passwords
    let isValid = false;
    if (adminPassword.startsWith("$2b$") || adminPassword.startsWith("$2a$")) {
      isValid = await bcrypt.compare(password, adminPassword);
    } else {
      isValid = password === adminPassword;
    }

    if (!isValid) {
      return NextResponse.json({ error: "密码错误" }, { status: 401 });
    }

    const token = signToken({ role: "admin", iat: Date.now() });

    const response = NextResponse.json({ success: true });
    response.cookies.set(COOKIE_NAME_EXPORT, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("POST /api/auth/login error:", error);
    return NextResponse.json({ error: "服务器错误" }, { status: 500 });
  }
}
