import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

const DEFAULT_SKILLS = [
  "AI 复合型工作",
  "平面 · 三维设计",
  "Blender 3D 渲染",
  "AI 编程",
  "视频剪辑",
  "MORE SKILLS",
];

export async function GET() {
  try {
    const setting = await prisma.siteSettings.findUnique({
      where: { key: "intro_skills" },
    });
    const skills = setting ? JSON.parse(setting.value) : DEFAULT_SKILLS;
    return NextResponse.json({ skills });
  } catch {
    return NextResponse.json({ skills: DEFAULT_SKILLS });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }
  try {
    const { skills } = await request.json();
    if (!Array.isArray(skills)) {
      return NextResponse.json({ error: "格式错误" }, { status: 400 });
    }
    const clean = skills.map((s: string) => String(s).trim()).filter(Boolean);
    await prisma.siteSettings.upsert({
      where: { key: "intro_skills" },
      update: { value: JSON.stringify(clean) },
      create: { key: "intro_skills", value: JSON.stringify(clean) },
    });
    return NextResponse.json({ ok: true, skills: clean });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? "保存失败" }, { status: 500 });
  }
}
