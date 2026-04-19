import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { verifyPassword } from "@/lib/password";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const login = String(body.login || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!login || !password) {
      return NextResponse.json(
        { error: "Missing email/username or password" },
        { status: 400 }
      );
    }

    const user = await db.user.findFirst({
      where: {
        OR: [{ username: login }, { email: login }],
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);

    if (!ok) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        wallet: user.wallet,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}