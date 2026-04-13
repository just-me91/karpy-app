import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const type = req.nextUrl.searchParams.get("type") || "mined";
    const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") || 20), 100);

    const orderBy =
      type === "balance"
        ? { balance: "desc" as const }
        : type === "referrals"
        ? { referrals: "desc" as const }
        : { totalMined: "desc" as const };

    const users = await db.user.findMany({
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
      items: users.map((user, index) => ({
        rank: index + 1,
        wallet: user.wallet,
        shortWallet: `${user.wallet.slice(0, 4)}...${user.wallet.slice(-4)}`,
        balance: user.balance,
        referrals: user.referrals,
        totalMined: user.totalMined,
        miningLevel: user.miningLevel,
      })),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Leaderboard error" },
      { status: 500 }
    );
  }
}