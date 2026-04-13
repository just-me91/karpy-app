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
      typeParam === "balance" || typeParam === "referrals" ? typeParam : "mined";

    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 20), 100);

    const orderBy =
      type === "balance"
        ? { balance: "desc" as const }
        : type === "referrals"
        ? { referrals: "desc" as const }
        : { totalMined: "desc" as const };

    const users: LeaderboardUser[] = await db.user.findMany({
      take: limit,
      orderBy,
      select: {
        wallet: true,
        balance: true,
        referrals: true,
        totalMined: true,
        miningLevel: true,
      },
    });

    return NextResponse.json({
      ok: true,
      type,
      items: users.map((user: LeaderboardUser, index: number) => ({
        rank: index + 1,
        wallet: user.wallet,
        shortWallet: `${user.wallet.slice(0, 4)}...${user.wallet.slice(-4)}`,
        balance: user.balance,
        referrals: user.referrals,
        totalMined: user.totalMined,
        miningLevel: user.miningLevel,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Leaderboard error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}