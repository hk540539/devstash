import { NextRequest, NextResponse } from "next/server";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { auth } from "@/auth";
import { s3, S3_BUCKET } from "@/lib/s3";
import { Readable } from "stream";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ key: string[] }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { key: segments } = await params;
  const key = segments.join("/");

  // Enforce that the file belongs to the requesting user
  if (!key.startsWith(session.user.id + "/")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const response = await s3.send(
      new GetObjectCommand({ Bucket: S3_BUCKET, Key: key }),
    );

    const body = response.Body;
    if (!body) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Convert SDK stream to Web ReadableStream
    const nodeStream = body as unknown as Readable;
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: Buffer) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
    });

    const fileName = req.nextUrl.searchParams.get("name") ?? key.split("/").pop() ?? "download";
    const contentType = response.ContentType ?? "application/octet-stream";

    return new NextResponse(webStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(fileName)}"`,
        "Cache-Control": "private, max-age=3600",
      },
    });
  } catch (err) {
    console.error("S3 download error:", err);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}