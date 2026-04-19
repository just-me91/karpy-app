import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        wallet: user.wallet,
        username: user.username,
        balance: user.balance,
        streak: user.streak,
        referrals: user.referrals,
        totalMined: user.totalMined,
        miningXp: user.miningXp,
        miningLevel: user.miningLevel,
        referralCode: user.referralCode,
        isPremium: user.isPremium,
        premiumExpiresAt: user.premiumExpiresAt,
        boostMultiplier: user.boostMultiplier,
        boostExpiresAt: user.boostExpiresAt,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Failed to load session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}