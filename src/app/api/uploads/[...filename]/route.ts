import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const MIME_TYPES: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".avif": "image/avif",
};

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ filename: string[] }> }
) {
  try {
    const { filename } = await context.params;
    if (!filename || filename.length === 0) {
      return new NextResponse("File not found", { status: 404 });
    }

    const requestedFilename = filename.join("/");
    // Prevent directory traversal
    const safeFilename = path.normalize(requestedFilename).replace(/^(\.\.[\/\\])+/, "");
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const filePath = path.join(uploadDir, safeFilename);

    if (!fs.existsSync(filePath)) {
      // 1. Try with sanitized filename (spaces replaced with _)
      const alternativePath = path.join(uploadDir, safeFilename.replace(/\s+/g, "_"));
      if (fs.existsSync(alternativePath)) {
        const ext = path.extname(alternativePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || "application/octet-stream";
        const fileBuffer = await fs.promises.readFile(alternativePath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }

      // 2. Fuzzy match by suffix/base name in uploadDir if timestamp had slight clock drift
      try {
        const baseName = safeFilename.replace(/^\d+[-_]/, "").replace(/\s+/g, "_");
        const dirFiles = await fs.promises.readdir(uploadDir);
        const match = dirFiles.find((f) => f.includes(baseName) || f.replace(/\s+/g, "_").includes(baseName));
        if (match) {
          const matchedPath = path.join(uploadDir, match);
          const ext = path.extname(matchedPath).toLowerCase();
          const contentType = MIME_TYPES[ext] || "application/octet-stream";
          const fileBuffer = await fs.promises.readFile(matchedPath);
          return new NextResponse(fileBuffer, {
            status: 200,
            headers: {
              "Content-Type": contentType,
              "Cache-Control": "public, max-age=31536000, immutable",
            },
          });
        }
      } catch (err) {
        console.warn("Fuzzy file search error:", err);
      }

      return new NextResponse("File not found", { status: 404 });
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || "application/octet-stream";
    const fileBuffer = await fs.promises.readFile(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("GET /api/uploads error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
