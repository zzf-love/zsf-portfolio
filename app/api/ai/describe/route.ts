import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import Anthropic from "@anthropic-ai/sdk";

const FOLDER_CONTEXT: Record<string, string> = {
  xcxd: "北京兴长信达科技发展有限公司（为 Kinder健达/费列罗/Nutella 等国际食品品牌做天猫旗舰店电商视觉）",
  add: "上海爱哆哆实业有限公司（母婴/儿童用品电商品牌）",
  older_work: "早期职业阶段的平面/电商设计作品",
  others: "个人创作项目或自由探索作品",
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageId, title, tags, folder, description } = body;

    if (!imageId) {
      return NextResponse.json({ error: "imageId is required" }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Anthropic API key not configured" },
        { status: 500 }
      );
    }

    const client = new Anthropic({ apiKey });

    const folderContext = FOLDER_CONTEXT[folder] || "独立设计项目";
    const tagsStr = Array.isArray(tags) && tags.length > 0 ? tags.join("、") : "未标注";

    const prompt = `你是一位资深视觉设计评论家。请为以下设计作品写一段专业的创意解读，约100-150字。

作品信息：
- 标题：${title || "（未命名）"}
- 所属项目：${folderContext}
- 使用工具/技术：${tagsStr}
- 设计师备注：${description || "（无）"}

写作要求：
1. 专业术语用英文（如 Blender、Photoshop、3D rendering、color grading、compositing 等），描述语言用中文
2. 从设计语言、视觉层次、色彩运用、工艺特点等角度切入
3. 体现作品的商业价值或艺术探索
4. 语气专业但不刻板，有设计师视角的温度感
5. 不要开头客套，直接进入评析
6. 不需要提及设计师姓名`;

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 400,
      messages: [{ role: "user", content: prompt }],
    });

    const aiText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Save aiDesc back to database
    if (aiText) {
      await prisma.image.update({
        where: { id: imageId },
        data: { aiDesc: aiText },
      });
    }

    return NextResponse.json({ description: aiText });
  } catch (error) {
    console.error("POST /api/ai/describe error:", error);
    return NextResponse.json(
      { error: "Failed to generate description" },
      { status: 500 }
    );
  }
}
