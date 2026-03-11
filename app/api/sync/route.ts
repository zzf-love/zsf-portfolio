import { NextResponse } from "next/server";
import { cloudinary } from "@/lib/cloudinary";
import { prisma } from "@/lib/db";
import { verifyAdminRequest } from "@/lib/auth";

/** 根据 Cloudinary 路径或文件名前缀推断所属分类
 *  优先读取路径中的文件夹部分（e.g. "xcxd/timestamp_img.jpg" → "xcxd"）
 *  其次回退到文件名前缀（e.g. "xcxd_xxx.jpg" → "xcxd"）
 */
function getFolderFromPublicId(publicId: string): string {
  const parts  = publicId.split("/");
  const name   = parts.pop() ?? publicId;
  const parent = parts.length > 0 ? parts[parts.length - 1] : "";

  // Cloudinary 文件夹名称直接对应 folder 值
  const VALID_FOLDERS = ["xcxd", "add", "older_work", "others"] as const;
  if (VALID_FOLDERS.includes(parent as typeof VALID_FOLDERS[number])) return parent;

  // 回退：文件名前缀
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

    let updated = 0;

    for (const res of validResources) {
      const ext      = res.format ? `.${res.format}` : "";
      const basename = (res.public_id.split("/").pop() ?? res.public_id);
      const filename = basename.includes(".") ? basename : basename + ext;
      const folder   = getFolderFromPublicId(res.public_id);

      // 先按 cloudinaryId 查
      const byId = await prisma.image.findFirst({ where: { cloudinaryId: res.public_id } });
      if (byId) {
        // cloudinaryId 匹配 → 若 URL 变了（CDN 路径调整）则更新
        if (byId.url !== res.secure_url) {
          await prisma.image.update({ where: { id: byId.id }, data: { url: res.secure_url } });
          updated++;
        } else {
          skipped++;
        }
        continue;
      }

      // 再按 filename 查（图片在 Cloudinary 里移动了文件夹，public_id 前缀变了）
      const byName = await prisma.image.findFirst({ where: { filename } });
      if (byName) {
        await prisma.image.update({
          where: { id: byName.id },
          data: { cloudinaryId: res.public_id, url: res.secure_url, folder },
        });
        updated++;
        continue;
      }

      // 全新图片 → 新建
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
      updated,
      skipped,
      total: validResources.length,
      message: `同步完成：新增 ${synced} 张，更新 ${updated} 张，已跳过 ${skipped} 张`,
    });
  } catch (error: any) {
    console.error("Sync error:", error);
    return NextResponse.json(
      { error: "同步失败：" + (error?.message ?? "未知错误") },
      { status: 500 }
    );
  }
}
