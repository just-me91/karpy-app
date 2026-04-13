import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  calculateMiningReward,
  MAX_SUPPLY,
} from "@/lib/karpy";

const COOLDOWN = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const { wallet } = await req.json();

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    const cleanWallet = wallet.toLowerCase().trim();

    let user = await db.user.findUnique({
      where: { wallet: cleanWallet },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          wallet: cleanWallet,
          balance: 0,
          streak: 0,
          referrals: 0,
          totalMined: 0,
          miningXp: 0,
          miningLevel: 1,
        },
      });
    }

    // cooldown check
    if (user.lastClaimAt) {
      const now = Date.now();
      const last = new Date(user.lastClaimAt).getTime();

      if (now - last < COOLDOWN) {
        return NextResponse.json({
          error: "Cooldown active",
        });
      }
    }

    // token stats
    let stats = await db.tokenStats.findFirst();

    if (!stats) {
      stats = await db.tokenStats.create({
        data: {
          maxSupply: MAX_SUPPLY,
          circulatingSupply: 0,
        },
      });
    }

    if (stats.circulatingSupply >= stats.maxSupply) {
      return NextResponse.json({
        error: "All supply mined",
      });
    }

    const rewardRaw = calculateMiningReward({
      level: user.miningLevel,
      streak: user.streak,
      referrals: user.referrals,
      circulatingSupply: stats.circulatingSupply,
    });

    const remaining = stats.maxSupply - stats.circulatingSupply;

    const reward = Math.max(0, Math.min(rewardRaw, remaining));

    const newStreak = user.streak + 1;
    const newXp = user.miningXp + reward;
    const newLevel = Math.floor(newXp / 100) + 1;

    const updatedUser = await db.user.update({
      where: { wallet: cleanWallet },
      data: {
        balance: { increment: reward },
        totalMined: { increment: reward },
        miningXp: newXp,
        miningLevel: newLevel,
        streak: newStreak,
        lastClaimAt: new Date(),
      },
    });

    await db.tokenStats.update({
      where: { id: stats.id },
      data: {
        circulatingSupply: { increment: reward },
      },
    });

    return NextResponse.json({
      reward,
      balance: updatedUser.balance,
      streak: updatedUser.streak,
      level: updatedUser.miningLevel,
    });
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}