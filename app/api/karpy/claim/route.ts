import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  canClaim,
  secondsRemaining,
  getDailyMiningReward,
  getMiningLevelFromXp,
  XP_PER_CLAIM,
} from "@/lib/karpy";
import { getWalletFromRequest, verifySignedRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    if (!verifySignedRequest(req)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const wallet = getWalletFromRequest(req);
    const user = await db.user.findUnique({ where: { wallet } });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!canClaim(user.lastClaimAt)) {
      return NextResponse.json(
        {
          error: "Cooldown active",
          secondsRemaining: secondsRemaining(user.lastClaimAt),
        },
        { status: 400 }
      );
    }

    const nextStreak = user.streak + 1;
    const nextXp = user.miningXp + XP_PER_CLAIM;

    const rewardData = await getDailyMiningReward(nextStreak, wallet, nextXp);
    const levelInfo = getMiningLevelFromXp(nextXp);

    const updated = await db.user.update({
      where: { wallet },
      data: {
        balance: { increment: rewardData.totalReward },
        totalMined: { increment: rewardData.totalReward },
        streak: nextStreak,
        miningXp: nextXp,
        miningLevel: levelInfo.level,
        lastClaimAt: new Date(),
        claims: {
          create: {
            amount: rewardData.totalReward,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      reward: rewardData.totalReward,
      baseReward: rewardData.baseReward,
      streakBonus: rewardData.streakBonus,
      holderBonus: rewardData.holderBonus,
      levelMultiplier: rewardData.levelMultiplier,
      balance: updated.balance,
      totalMined: updated.totalMined,
      streak: updated.streak,
      miningXp: updated.miningXp,
      miningLevel: updated.miningLevel,
      lastClaimAt: new Date(updated.lastClaimAt || new Date()).getTime(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Claim error" },
      { status: 500 }
    );
  }
}