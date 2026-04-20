import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDailyChestReward } from "@/lib/karpy";
import { getSessionUser } from "@/lib/auth";

const CHEST_COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function POST() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const lastClaim = await db.dailyChestClaim.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    const lastAt = lastClaim ? new Date(lastClaim.createdAt).getTime() : 0;

    if (lastAt && Date.now() - lastAt < CHEST_COOLDOWN_MS) {
      return NextResponse.json(
        {
          error: "Daily chest cooldown active",
          secondsRemaining: Math.ceil((CHEST_COOLDOWN_MS - (Date.now() - lastAt)) / 1000),
        },
        { status: 400 }
      );
    }

    const reward = getDailyChestReward(user);

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: reward },
      },
    });

    await db.dailyChestClaim.create({
      data: {
        userId: user.id,
        reward,
      },
    });

    return NextResponse.json({
      ok: true,
      reward,
      balance: updated.balance,
      secondsRemaining: 24 * 60 * 60,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Daily chest failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}