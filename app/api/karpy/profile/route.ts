import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  TASKS,
  makeReferralCode,
  getDailyMiningReward,
  getMiningProgress,
  XP_PER_CLAIM,
} from "@/lib/karpy";

export async function GET(req: NextRequest) {
  try {
    const wallet = req.nextUrl.searchParams.get("wallet") || "";

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    let user = await db.user.findUnique({
      where: { wallet },
      include: {
        taskCompletions: true,
        claims: true,
      },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          wallet,
          referralCode: makeReferralCode(wallet),
        },
        include: {
          taskCompletions: true,
          claims: true,
        },
      });
    }

    const completed = new Set(user.taskCompletions.map((t) => t.taskId));

    const tasks = TASKS.map((t) => ({
      ...t,
      done: completed.has(t.id),
    }));

    const nextStreak = user.streak + 1;
    const previewXp = user.miningXp + XP_PER_CLAIM;
    const preview = await getDailyMiningReward(nextStreak, wallet, previewXp);
    const progress = getMiningProgress(user.miningXp);

    return NextResponse.json({
      wallet: user.wallet,
      balance: user.balance,
      streak: user.streak,
      referrals: user.referrals,
      referralCode: user.referralCode,
      totalMined: user.totalMined,
      miningXp: user.miningXp,
      miningLevel: user.miningLevel,
      miningProgress: progress,
      rewardPreview: {
        baseReward: preview.baseReward,
        streakBonus: preview.streakBonus,
        holderBonus: preview.holderBonus,
        levelMultiplier: preview.levelMultiplier,
        totalReward: preview.totalReward,
      },
      tasks,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    );
  }
}