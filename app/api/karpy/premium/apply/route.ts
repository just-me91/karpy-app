import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const wallet = String(body.wallet || "").toLowerCase();

    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await db.user.update({
      where: { wallet },
      data: {
        isPremium: true,
        premiumExpiresAt: expires,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message });
  }
}