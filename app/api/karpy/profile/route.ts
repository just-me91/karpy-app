import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  TASKS,
  calculateDailyMiningReward,
  getMiningProgress,
} from "@/lib/karpy";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const completed = await db.taskCompletion.findMany({
      where: { userId: user.id },
      select: { taskId: true },
    });

    const doneSet = new Set(completed.map((t) => t.taskId));

    let stats = await db.tokenStats.findFirst();

    if (!stats) {
      stats = await db.tokenStats.create({
        data: {
          maxSupply: 1_000_000_000,
          circulatingSupply: 0,
        },
      });
    }

    const rewardPreview = calculateDailyMiningReward(user);
    const miningProgress = getMiningProgress(user.miningXp);

    return NextResponse.json({
      wallet: user.wallet,
      balance: user.balance,
      streak: user.streak,
      referrals: user.referrals,
      referralCode: user.referralCode,
      totalMined: user.totalMined,
      miningXp: user.miningXp,
      miningLevel: user.miningLevel,
      miningProgress,
      rewardPreview,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      boostMultiplier: user.boostMultiplier,
      boostExpiresAt: user.boostExpiresAt,
      supply: {
        circulating: stats.circulatingSupply,
        maxSupply: stats.maxSupply,
        remaining: Math.max(0, stats.maxSupply - stats.circulatingSupply),
      },
      tasks: TASKS.map((task) => ({
        ...task,
        done: doneSet.has(task.id),
      })),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Profile load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}