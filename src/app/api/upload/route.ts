import { NextRequest, NextResponse } from "next/server";
import { adminStorage } from "@/lib/firebase/admin";
import fs from "fs";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueFilename = `${Date.now()}-${sanitizedName}`;

    // 1. Always persist to public/uploads on disk for instantaneous local serving
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const localFilePath = path.join(uploadDir, uniqueFilename);
    await fs.promises.writeFile(localFilePath, buffer);
    const localPublicUrl = `/uploads/${uniqueFilename}`;

    // Mirror to baseline owner avatar for permanent zero-flicker reload
    try {
      const ownerDir = path.join(process.cwd(), "public", "images", "user");
      await fs.promises.writeFile(path.join(ownerDir, "owner.png"), buffer);
      await fs.promises.writeFile(path.join(ownerDir, "owner.jpg"), buffer);
    } catch {
      // ignore
    }

    // 2. If Firebase Storage is connected, also mirror to cloud bucket
    if (process.env.FIREBASE_PROJECT_ID && adminStorage) {
      try {
        const bucket = adminStorage.bucket();
        const cloudFilename = `uploads/${uniqueFilename}`;
        const fileRef = bucket.file(cloudFilename);

        await fileRef.save(buffer, {
          metadata: { contentType: file.type },
          public: true,
        });

        const cloudUrl = `https://storage.googleapis.com/${bucket.name}/${cloudFilename}`;
        return NextResponse.json({ success: true, url: cloudUrl });
      } catch (storageErr) {
        console.warn("Firebase storage mirror failed, using local disk URL:", storageErr);
      }
    }

    return NextResponse.json({ success: true, url: localPublicUrl });
  } catch (error) {
    console.error("POST /api/upload error:", error);
    return NextResponse.json({ success: false, error: "File upload failed" }, { status: 500 });
  }
}
