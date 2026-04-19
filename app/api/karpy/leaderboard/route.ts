import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function shortenWallet(value: string) {
  if (!value) return "-";
  if (value.length <= 12) return value;
  return `${value.slice(0, 6)}...${value.slice(-4)}`;
}

export async function GET(req: NextRequest) {
  try {
    const type = String(req.nextUrl.searchParams.get("type") || "mined");
    const limit = Math.min(50, Math.max(1, Number(req.nextUrl.searchParams.get("limit") || "10")));

    const orderBy =
      type === "balance"
        ? { balance: "desc" as const }
        : type === "referrals"
        ? { referrals: "desc" as const }
        : { totalMined: "desc" as const };

    const users = await db.user.findMany({
      orderBy,
      take: limit,
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
      items: users.map((user, index) => ({
        rank: index + 1,
        wallet: user.wallet,
        shortWallet: shortenWallet(user.wallet),
        balance: user.balance,
        referrals: user.referrals,
        totalMined: user.totalMined,
        miningLevel: user.miningLevel,
      })),
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Leaderboard failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}