import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  XP_PER_CLAIM,
  calculateDailyMiningReward,
  getMiningLevelFromXp,
} from "@/lib/karpy";
import { getSessionUser } from "@/lib/auth";

const CLAIM_COOLDOWN_MS = 24 * 60 * 60 * 1000;
const STREAK_BREAK_MS = 36 * 60 * 60 * 1000;

export async function POST() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = Date.now();
    const lastClaimAt = user.lastClaimAt ? new Date(user.lastClaimAt).getTime() : 0;

    if (lastClaimAt && now - lastClaimAt < CLAIM_COOLDOWN_MS) {
      const secondsRemaining = Math.ceil((CLAIM_COOLDOWN_MS - (now - lastClaimAt)) / 1000);
      return NextResponse.json(
        {
          error: "Cooldown active",
          secondsRemaining,
        },
        { status: 400 }
      );
    }

    const nextStreak =
      lastClaimAt && now - lastClaimAt > STREAK_BREAK_MS ? 1 : Math.max(1, user.streak + 1);

    const rewardInfo = calculateDailyMiningReward({
      ...user,
      streak: nextStreak,
    });

    const nextXp = user.miningXp + XP_PER_CLAIM;
    const nextLevel = getMiningLevelFromXp(nextXp);

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: rewardInfo.totalReward },
        totalMined: { increment: rewardInfo.totalReward },
        miningXp: nextXp,
        miningLevel: nextLevel,
        streak: nextStreak,
        lastClaimAt: new Date(),
      },
    });

    await db.claim.create({
      data: {
        userId: user.id,
        amount: rewardInfo.totalReward,
      },
    });

    let stats = await db.tokenStats.findFirst();

    if (!stats) {
      stats = await db.tokenStats.create({
        data: {
          maxSupply: 1_000_000_000,
          circulatingSupply: 0,
        },
      });
    }

    await db.tokenStats.update({
      where: { id: stats.id },
      data: {
        circulatingSupply: {
          increment: rewardInfo.totalReward,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      reward: rewardInfo.totalReward,
      baseReward: rewardInfo.baseReward,
      streakBonus: rewardInfo.streakBonus,
      holderBonus: rewardInfo.holderBonus,
      levelMultiplier: rewardInfo.levelMultiplier,
      balance: updated.balance,
      totalMined: updated.totalMined,
      miningXp: updated.miningXp,
      miningLevel: updated.miningLevel,
      streak: updated.streak,
      secondsRemaining: 24 * 60 * 60,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Claim failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}