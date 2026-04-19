import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { PREMIUM_COST_KPY } from "@/lib/karpy";
import { getSessionUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.balance < PREMIUM_COST_KPY) {
      return NextResponse.json(
        { error: `Not enough KPY. Need ${PREMIUM_COST_KPY}` },
        { status: 400 }
      );
    }

    const baseTime =
      user.premiumExpiresAt && new Date(user.premiumExpiresAt).getTime() > Date.now()
        ? new Date(user.premiumExpiresAt).getTime()
        : Date.now();

    const expiresAt = new Date(baseTime + 30 * 24 * 60 * 60 * 1000);

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        balance: { decrement: PREMIUM_COST_KPY },
        isPremium: true,
        premiumExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Premium activated for 30 days",
      balance: updated.balance,
      isPremium: updated.isPremium,
      premiumExpiresAt: updated.premiumExpiresAt,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Premium failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}