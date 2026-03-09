import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const showHidden = new URL(request.url).searchParams.get("showHidden") === "true";
    const where = showHidden ? {} : { visible: true };

    const media = await prisma.media.findMany({
      where,
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    });

    const parsed = media.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }));

    return NextResponse.json({ media: parsed });
  } catch (error) {
    console.error("GET /api/media error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { type, platform, url, embedUrl, caption, sortOrder } = body;

    if (!type || !platform || !url) {
      return NextResponse.json(
        { error: "type, platform, url are required" },
        { status: 400 }
      );
    }

    // Get current max sortOrder
    const maxOrder = await prisma.media.findFirst({
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const newSortOrder = sortOrder ?? (maxOrder ? maxOrder.sortOrder + 1 : 0);

    const media = await prisma.media.create({
      data: {
        type,
        platform,
        url,
        embedUrl: embedUrl || "",
        caption: caption || "",
        sortOrder: newSortOrder,
      },
    });

    return NextResponse.json({
      media: { ...media, createdAt: media.createdAt.toISOString() },
    });
  } catch (error) {
    console.error("POST /api/media error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
