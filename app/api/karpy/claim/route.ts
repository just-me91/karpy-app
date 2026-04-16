import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  calculateBaseReward,
  applyMultipliers,
  MAX_SUPPLY,
  getMiningLevelFromXp,
} from "@/lib/karpy";

const COOLDOWN = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const wallet = String(body.wallet || "").toLowerCase();

    if (!wallet) {
      return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    let user = await db.user.findUnique({ where: { wallet } });

    if (!user) {
      user = await db.user.create({
        data: {
          wallet,
          balance: 0,
          streak: 0,
          referrals: 0,
          totalMined: 0,
          miningXp: 0,
          miningLevel: 1,
          boostMultiplier: 1,
          isPremium: false,
        },
      });
    }

    if (user.lastClaimAt) {
      const diff = Date.now() - new Date(user.lastClaimAt).getTime();
      if (diff < COOLDOWN) {
        return NextResponse.json({
          error: "Cooldown",
          cooldownMs: COOLDOWN - diff,
        });
      }
    }

    let stats = await db.tokenStats.findFirst();

    if (!stats) {
      stats = await db.tokenStats.create({
        data: {
          maxSupply: MAX_SUPPLY,
          circulatingSupply: 0,
        },
      });
    }

    const baseReward = calculateBaseReward({
      level: user.miningLevel,
      streak: user.streak + 1,
      circulatingSupply: stats.circulatingSupply,
    });

    const finalReward = applyMultipliers({
      baseReward,
      isPremium: user.isPremium,
      premiumExpiresAt: user.premiumExpiresAt,
      boostMultiplier: user.boostMultiplier,
      boostExpiresAt: user.boostExpiresAt,
    });

    const newXp = user.miningXp + finalReward;
    const newLevel = getMiningLevelFromXp(newXp);

    const updated = await db.user.update({
      where: { wallet },
      data: {
        balance: { increment: finalReward },
        totalMined: { increment: finalReward },
        miningXp: newXp,
        miningLevel: newLevel,
        streak: user.streak + 1,
        lastClaimAt: new Date(),
      },
    });

    await db.tokenStats.update({
      where: { id: stats.id },
      data: {
        circulatingSupply: { increment: finalReward },
      },
    });

    return NextResponse.json({
      ok: true,
      reward: finalReward,
      balance: updated.balance,
      miningLevel: updated.miningLevel,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}