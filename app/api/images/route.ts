import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { weightedShuffle } from "@/lib/categories";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const folder = searchParams.get("folder");
    const minStarsParam = searchParams.get("minStars");
    const minStars = minStarsParam ? parseInt(minStarsParam, 10) : 0;
    const showHidden = searchParams.get("showHidden") === "true";

    const where: Record<string, unknown> = {};

    if (folder) {
      where.folder = folder;
    }

    if (!showHidden) {
      where.visible = true;
    }

    if (minStars > 0) {
      where.stars = { gte: minStars };
    }

    const images = await prisma.image.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Parse tags JSON and apply weighted shuffle
    const parsed = images.map((img) => ({
      ...img,
      tags: safeParseJson(img.tags),
      createdAt: img.createdAt.toISOString(),
      updatedAt: img.updatedAt.toISOString(),
    }));

    const shuffled = minStars > 0 ? weightedShuffle(parsed) : parsed;

    return NextResponse.json({ images: shuffled });
  } catch (error) {
    console.error("GET /api/images error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

function safeParseJson(str: string): string[] {
  try {
    const parsed = JSON.parse(str);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}
