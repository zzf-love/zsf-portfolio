import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { verifyAdminRequest } from "@/lib/auth";
import { FOLDERS } from "@/lib/categories";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  if (!verifyAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = formData.get("folder") as string | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate folder
    const validFolder = FOLDERS.includes(folder as (typeof FOLDERS)[number])
      ? (folder as string)
      : "others";

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max size is ${MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Convert to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate filename (sanitize original filename)
    const originalName = file.name.replace(/[^a-zA-Z0-9.\-_\u4e00-\u9fa5]/g, "_");
    const timestamp = Date.now();
    const filename = `${timestamp}_${originalName}`;

    // Upload to Cloudinary
    const { publicId, secureUrl } = await uploadToCloudinary(
      buffer,
      validFolder,
      filename
    );

    // Check if image with same filename already exists
    const existing = await prisma.image.findFirst({
      where: { cloudinaryId: publicId },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Image already exists", image: existing },
        { status: 409 }
      );
    }

    // Save to database
    const image = await prisma.image.create({
      data: {
        filename,
        cloudinaryId: publicId,
        url: secureUrl,
        folder: validFolder,
        stars: 0, // Default: draft
        tags: "[]",
        title: "",
        description: "",
        visible: true,
      },
    });

    return NextResponse.json({
      image: {
        ...image,
        tags: [],
        createdAt: image.createdAt.toISOString(),
        updatedAt: image.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
