import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const wallet = String(body.wallet || "").toLowerCase();
    const type = body.type;

    const multiplier = type === "x3" ? 3 : 2;

    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.user.update({
      where: { wallet },
      data: {
        boostMultiplier: multiplier,
        boostExpiresAt: expires,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}