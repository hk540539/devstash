import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import { EMAIL_VERIFICATION_ENABLED } from "@/lib/flags";
import { rateLimit, getIP, rateLimitResponse } from "@/lib/rate-limit";

export async function POST(req: NextRequest) {
  if (!EMAIL_VERIFICATION_ENABLED) {
    return NextResponse.json(
      { error: "Email verification is not enabled." },
      { status: 400 }
    );
  }

  try {
    const { email } = await req.json();

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const ip = getIP(req);

    const rl = await rateLimit("resendVerification", `${ip}:${normalizedEmail}`);
    if (!rl.success) {
      return rateLimitResponse(rl.reset);
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, emailVerified: true },
    });

    // Always return success to avoid user enumeration
    if (!user || user.emailVerified) {
      return NextResponse.json({ success: true });
    }

    // Delete any existing verification token before creating a new one
    await prisma.verificationToken.deleteMany({
      where: { identifier: normalizedEmail },
    });

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: { identifier: normalizedEmail, token, expires },
    });

    try {
      await sendVerificationEmail(normalizedEmail, token);
    } catch (err) {
      console.error("[resend-verification] email send failed:", err);
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error." },
      { status: 500 }
    );
  }
}
