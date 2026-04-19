import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const token = String(body.token || "").trim();
    const password = String(body.password || "");

    if (!token) {
      return NextResponse.json(
        { error: "Missing token" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const resetToken = await db.passwordResetToken.findFirst({
      where: {
        token,
        usedAt: null,
      },
      include: {
        user: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or used token" },
        { status: 400 }
      );
    }

    if (resetToken.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Reset token expired" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    await db.user.update({
      where: { id: resetToken.userId },
      data: {
        passwordHash,
      },
    });

    await db.passwordResetToken.update({
      where: { id: resetToken.id },
      data: {
        usedAt: new Date(),
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Password reset successful",
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Reset password failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}