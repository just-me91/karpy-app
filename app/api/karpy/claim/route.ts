import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  calculateMiningReward,
  MAX_SUPPLY,
  makeReferralCode,
  getMiningLevelFromXp,
} from "@/lib/karpy";

const COOLDOWN_MS = 24 * 60 * 60 * 1000;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const walletRaw = typeof body?.wallet === "string" ? body.wallet : "";
    const cleanWallet = walletRaw.toLowerCase().trim();

    if (!cleanWallet) {
      return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
    }

    let user = await db.user.findUnique({
      where: { wallet: cleanWallet },
    });

    if (!user) {
      user = await db.user.create({
        data: {
          wallet: cleanWallet,
          referralCode: makeReferralCode(cleanWallet),
          balance: 0,
          streak: 0,
          referrals: 0,
          totalMined: 0,
          miningXp: 0,
          miningLevel: 1,
        },
      });
    }

    if (user.lastClaimAt) {
      const lastClaimTs = new Date(user.lastClaimAt).getTime();
      const nowTs = Date.now();
      const remainingMs = COOLDOWN_MS - (nowTs - lastClaimTs);

      if (remainingMs > 0) {
        return NextResponse.json(
          {
            error: "Cooldown active",
            cooldownMs: remainingMs,
          },
          { status: 429 }
        );
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

    if (stats.circulatingSupply >= stats.maxSupply) {
      return NextResponse.json(
        { error: "Max supply reached" },
        { status: 400 }
      );
    }

    const rawReward = calculateMiningReward({
      level: user.miningLevel,
      streak: user.streak + 1,
      referrals: user.referrals,
      circulatingSupply: stats.circulatingSupply,
      wallet: cleanWallet,
    });

    const remainingSupply = Math.max(
      0,
      stats.maxSupply - stats.circulatingSupply
    );

    const finalReward = Math.min(rawReward, remainingSupply);

    if (finalReward <= 0) {
      return NextResponse.json(
        { error: "No reward available" },
        { status: 400 }
      );
    }

    const newXp = user.miningXp + finalReward;
    const newLevel = getMiningLevelFromXp(newXp);

    const updatedUser = await db.user.update({
      where: { wallet: cleanWallet },
      data: {
        balance: { increment: finalReward },
        totalMined: { increment: finalReward },
        miningXp: newXp,
        miningLevel: newLevel,
        streak: user.streak + 1,
        lastClaimAt: new Date(),
        claims: {
          create: {
            amount: finalReward,
          },
        },
      },
      include: {
        claims: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    const updatedStats = await db.tokenStats.update({
      where: { id: stats.id },
      data: {
        circulatingSupply: { increment: finalReward },
      },
    });

    return NextResponse.json({
      ok: true,
      reward: finalReward,
      wallet: updatedUser.wallet,
      balance: updatedUser.balance,
      streak: updatedUser.streak,
      totalMined: updatedUser.totalMined,
      miningXp: updatedUser.miningXp,
      miningLevel: updatedUser.miningLevel,
      lastClaimAt: updatedUser.lastClaimAt,
      claimId: updatedUser.claims[0]?.id ?? null,
      supply: {
        circulating: updatedStats.circulatingSupply,
        maxSupply: updatedStats.maxSupply,
        remaining: Math.max(
          0,
          updatedStats.maxSupply - updatedStats.circulatingSupply
        ),
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Server error";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}