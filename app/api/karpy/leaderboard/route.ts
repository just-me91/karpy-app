import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

type LeaderboardType = "mined" | "balance" | "referrals";

type LeaderboardUser = {
  wallet: string;
  balance: number;
  referrals: number;
  totalMined: number;
  miningLevel: number;
};

export async function GET(req: NextRequest) {
  try {
    const typeParam = req.nextUrl.searchParams.get("type") || "mined";
    const type: LeaderboardType =
      typeParam === "balance" || typeParam === "referrals"
        ? typeParam
        : "mined";

    const limitRaw = Number(req.nextUrl.searchParams.get("limit") || 10);
    const limit = Math.max(1, Math.min(limitRaw, 100));

    const orderBy =
      type === "balance"
        ? { balance: "desc" as const }
        : type === "referrals"
        ? { referrals: "desc" as const }
        : { totalMined: "desc" as const };

    const users = (await db.user.findMany({
      take: limit,
      orderBy,
      select: {
        wallet: true,
        balance: true,
        referrals: true,
        totalMined: true,
        miningLevel: true,
      },
    })) as LeaderboardUser[];

    const items = users.map((user: LeaderboardUser, index: number) => ({
      rank: index + 1,
      wallet: user.wallet,
      shortWallet:
        user.wallet.length > 10
          ? `${user.wallet.slice(0, 4)}...${user.wallet.slice(-4)}`
          : user.wallet,
      balance: user.balance,
      referrals: user.referrals,
      totalMined: user.totalMined,
      miningLevel: user.miningLevel,
    }));

    return NextResponse.json({
      ok: true,
      type,
      items,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Leaderboard error";

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}