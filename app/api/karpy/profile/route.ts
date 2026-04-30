import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  TASKS,
  ACHIEVEMENTS,
  FOUNDER_PACKS,
  PREMIUM_PERKS,
  calculateDailyMiningReward,
  getMiningProgress,
  getDailyChestReward,
  getDailyChestTier,
  checkAchievementUnlocked,
  checkTaskUnlocked,
} from "@/lib/karpy";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [completedTasks, achievementClaims, chestClaim, founderPurchases] = await Promise.all([
      db.taskCompletion.findMany({
        where: { userId: user.id },
        select: { taskId: true },
      }),
      db.achievementClaim.findMany({
        where: { userId: user.id },
        select: { achievementId: true },
      }),
      db.dailyChestClaim.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
      }),
      db.founderPackPurchase.findMany({
        where: { userId: user.id },
        select: { packId: true },
      }),
    ]);

    let stats = await db.tokenStats.findFirst();

    if (!stats) {
      stats = await db.tokenStats.create({
        data: {
          maxSupply: 1_000_000_000,
          circulatingSupply: 0,
        },
      });
    }

    const completedTaskSet = new Set(completedTasks.map((t) => t.taskId));
    const achievementClaimSet = new Set(achievementClaims.map((a) => a.achievementId));
    const founderPackSet = new Set(founderPurchases.map((p) => p.packId));

    const rewardPreview = calculateDailyMiningReward(user);
    const miningProgress = getMiningProgress(user.miningXp);

    const chestCooldownMs = 24 * 60 * 60 * 1000;
    const chestLastAt = chestClaim ? new Date(chestClaim.createdAt).getTime() : 0;
    const chestAvailable = !chestLastAt || Date.now() - chestLastAt >= chestCooldownMs;
    const chestSecondsRemaining = chestAvailable
      ? 0
      : Math.ceil((chestCooldownMs - (Date.now() - chestLastAt)) / 1000);

    return NextResponse.json({
      wallet: user.wallet,
      username: user.username,
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
      premiumPerks: PREMIUM_PERKS,
      supply: {
        circulating: stats.circulatingSupply,
        maxSupply: stats.maxSupply,
        remaining: Math.max(0, stats.maxSupply - stats.circulatingSupply),
      },
      dailyChest: {
        available: chestAvailable,
        nextReward: getDailyChestReward(user),
        tier: getDailyChestTier(user),
        secondsRemaining: chestSecondsRemaining,
      },
      tasks: TASKS.map((task) => ({
        ...task,
        done: completedTaskSet.has(task.id),
        unlocked: checkTaskUnlocked(user, task.id),
      })),
      achievements: ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        unlocked: checkAchievementUnlocked(user, achievement.id),
        claimed: achievementClaimSet.has(achievement.id),
      })),
      founderPacks: FOUNDER_PACKS.map((pack) => ({
        ...pack,
        purchased: founderPackSet.has(pack.id),
      })),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Profile load failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}