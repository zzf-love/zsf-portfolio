import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

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
    const { visible, caption, sortOrder, embedUrl, url } = body;

    const updateData: Record<string, unknown> = {};
    if (visible !== undefined) updateData.visible = visible;
    if (caption !== undefined) updateData.caption = caption;
    if (sortOrder !== undefined) updateData.sortOrder = sortOrder;
    if (embedUrl !== undefined) updateData.embedUrl = embedUrl;
    if (url !== undefined) updateData.url = url;

    const updated = await prisma.media.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      media: { ...updated, createdAt: updated.createdAt.toISOString() },
    });
  } catch (error) {
    console.error("PATCH /api/media/[id] error:", error);
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
    await prisma.media.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/media/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
