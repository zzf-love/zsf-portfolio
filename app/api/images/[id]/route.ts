import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";
import { deleteFromCloudinary } from "@/lib/cloudinary";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const body = await request.json();
    const { stars, tags, title, description, visible, aiDesc } = body;

    const updateData: Record<string, unknown> = {};
    if (stars !== undefined) updateData.stars = stars;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (visible !== undefined) updateData.visible = visible;
    if (aiDesc !== undefined) updateData.aiDesc = aiDesc;

    const updated = await prisma.image.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      image: {
        ...updated,
        tags: safeParseJson(updated.tags),
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("PATCH /api/images/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const image = await prisma.image.findUnique({ where: { id } });
    if (!image) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // Delete from Cloudinary if has cloudinaryId
    if (image.cloudinaryId) {
      try {
        await deleteFromCloudinary(image.cloudinaryId);
      } catch (err) {
        console.warn("Failed to delete from Cloudinary:", err);
      }
    }

    await prisma.image.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/images/[id] error:", error);
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
