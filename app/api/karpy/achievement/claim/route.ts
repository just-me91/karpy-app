import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ACHIEVEMENTS, checkAchievementUnlocked } from "@/lib/karpy";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const achievementId = String(body.achievementId || "");

    const achievement = ACHIEVEMENTS.find((a) => a.id === achievementId);

    if (!achievement) {
      return NextResponse.json({ error: "Invalid achievement" }, { status: 400 });
    }

    if (!checkAchievementUnlocked(user, achievementId)) {
      return NextResponse.json({ error: "Achievement not unlocked yet" }, { status: 400 });
    }

    const existing = await db.achievementClaim.findUnique({
      where: {
        userId_achievementId: {
          userId: user.id,
          achievementId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Achievement already claimed" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: achievement.reward },
        achievementClaims: {
          create: {
            achievementId,
            reward: achievement.reward,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      reward: achievement.reward,
      balance: updated.balance,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Achievement claim failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}