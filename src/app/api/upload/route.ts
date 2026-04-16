import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { s3, S3_BUCKET, ALLOWED_IMAGE_TYPES, ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from "@/lib/s3";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const itemType = formData.get("itemType") as string | null; // "File" | "Image"

  if (!file || !itemType) {
    return NextResponse.json({ error: "Missing file or itemType" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "File exceeds 5 MB limit" }, { status: 400 });
  }

  const allowedTypes = itemType === "Image" ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;
  const ext = allowedTypes[file.type];
  if (!ext) {
    return NextResponse.json({ error: `File type "${file.type}" is not allowed` }, { status: 400 });
  }

  const key = `${session.user.id}/${randomUUID()}${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  try {
    await s3.send(
      new PutObjectCommand({
        Bucket: S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: file.type,
      }),
    );

    return NextResponse.json({
      key,
      fileName: file.name,
      fileSize: file.size,
      contentType: file.type,
    });
  } catch (err) {
    console.error("S3 upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}