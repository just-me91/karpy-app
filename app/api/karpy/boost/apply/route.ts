import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { BOOST_X2_COST_KPY } from "@/lib/karpy";
import { getSessionUser } from "@/lib/auth";

export async function POST() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.balance < BOOST_X2_COST_KPY) {
      return NextResponse.json(
        { error: `Not enough KPY. Need ${BOOST_X2_COST_KPY}` },
        { status: 400 }
      );
    }

    const baseTime =
      user.boostExpiresAt && new Date(user.boostExpiresAt).getTime() > Date.now()
        ? new Date(user.boostExpiresAt).getTime()
        : Date.now();

    const expiresAt = new Date(baseTime + 24 * 60 * 60 * 1000);

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        balance: { decrement: BOOST_X2_COST_KPY },
        boostMultiplier: 2,
        boostExpiresAt: expiresAt,
      },
    });

    return NextResponse.json({
      ok: true,
      message: "x2 boost activated for 24h",
      balance: updated.balance,
      boostMultiplier: updated.boostMultiplier,
      boostExpiresAt: updated.boostExpiresAt,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Boost failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}