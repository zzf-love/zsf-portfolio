import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

/** 根据文件名前缀推断所属分类 */
function getFolderFromPublicId(publicId: string): string {
  const name = publicId.split("/").pop() ?? publicId;
  if (name.startsWith("ow_"))   return "older_work";
  if (name.startsWith("add_"))  return "add";
  if (name.startsWith("xcxd_")) return "xcxd";
  if (name.startsWith("ot_"))   return "others";
  return "others";
}

export async function POST(request: Request) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "未授权" }, { status: 401 });
  }

  try {
    let allResources: any[] = [];
    let nextCursor: string | undefined;

    // 分页拉取 Cloudinary 所有图片
    do {
      const result: any = await cloudinary.api.resources({
        type: "upload",
        resource_type: "image",
        max_results: 500,
        ...(nextCursor ? { next_cursor: nextCursor } : {}),
      });
      allResources = allResources.concat(result.resources ?? []);
      nextCursor = result.next_cursor;
    } while (nextCursor);

    let synced = 0;
    let skipped = 0;

    // 过滤 Cloudinary 内置示例图片
    const SAMPLE_PREFIXES = ["sample", "cld-sample"];
    const validResources = allResources.filter((res) => {
      const basename = res.public_id.split("/").pop() ?? res.public_id;
      // 跳过 Cloudinary 自带示例（sample, cld-sample, cld-sample-2 等）
      if (SAMPLE_PREFIXES.some((p) => basename === p || basename.startsWith(p + "-"))) return false;
      // 只接受符合命名规范的图片（ow_, add_, xcxd_, ot_ 前缀）
      const hasValidPrefix = ["ow_", "add_", "xcxd_", "ot_"].some((p) => basename.startsWith(p));
      return hasValidPrefix;
    });

    for (const res of validResources) {
      const ext      = res.format ? `.${res.format}` : "";
      const basename = (res.public_id.split("/").pop() ?? res.public_id);
      const filename = basename.includes(".") ? basename : basename + ext;

      // 已存在则跳过
      const existing = await prisma.image.findFirst({
        where: { OR: [{ filename }, { cloudinaryId: res.public_id }] },
      });
      if (existing) { skipped++; continue; }

      const folder = getFolderFromPublicId(res.public_id);

      await prisma.image.create({
        data: {
          filename,
          cloudinaryId: res.public_id,
          url: res.secure_url,
          folder,
          stars: 0,
          tags: "[]",
          visible: true,
        },
      });
      synced++;
    }

    return NextResponse.json({
      synced,
      skipped,
      total: validResources.length,
      message: `同步完成：新增 ${synced} 张，已跳过 ${skipped} 张`,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "同步失败：" + (error?.message ?? "未知错误") },
      { status: 500 }
    );
  }
}
