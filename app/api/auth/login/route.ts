import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyPassword } from "@/lib/password";
import { createSession } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const login = String(body.username || "");
    const password = String(body.password || "");

    if (!login || !password) {
      return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
    }

    // 🔥 DOAR username, fără email
    const user = await db.user.findFirst({
      where: {
        username: login,
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);

    if (!valid) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await createSession(user.id);

    const res = NextResponse.json({ ok: true });

    res.cookies.set("karpy_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
    });

    return res;
  } catch (e: any) {
    return NextResponse.json(
      { error: e.message || "Login error" },
      { status: 500 }
    );
  }
}