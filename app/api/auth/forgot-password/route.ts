import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { randomToken } from "@/lib/auth";
import { sendPasswordResetEmail } from "@/lib/email";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const email = String(body.email || "").trim().toLowerCase();

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email required" },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        ok: true,
        message: "If that email exists, a reset link was sent.",
      });
    }

    await db.passwordResetToken.updateMany({
      where: {
        userId: user.id,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    const token = randomToken(32);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt,
      },
    });

    await sendPasswordResetEmail(email, token);

    return NextResponse.json({
      ok: true,
      message: "If that email exists, a reset link was sent.",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Forgot password failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}