import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  REFERRAL_REWARD_NEW_USER,
  REFERRAL_REWARD_OWNER,
} from "@/lib/karpy";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const code = String(body.code || "").trim().toUpperCase();

    if (!code) {
      return NextResponse.json({ error: "Missing referral code" }, { status: 400 });
    }

    if (user.referredBy) {
      return NextResponse.json({ error: "Referral already used" }, { status: 400 });
    }

    const owner = await db.user.findFirst({
      where: { referralCode: code },
    });

    if (!owner) {
      return NextResponse.json({ error: "Referral code not found" }, { status: 404 });
    }

    if (owner.id === user.id) {
      return NextResponse.json({ error: "You cannot use your own referral code" }, { status: 400 });
    }

    await db.user.update({
      where: { id: user.id },
      data: {
        referredBy: code,
        balance: { increment: REFERRAL_REWARD_NEW_USER },
      },
    });

    await db.user.update({
      where: { id: owner.id },
      data: {
        referrals: { increment: 1 },
        balance: { increment: REFERRAL_REWARD_OWNER },
      },
    });

    return NextResponse.json({
      ok: true,
      message: "Referral applied successfully",
      rewardUser: REFERRAL_REWARD_NEW_USER,
      rewardOwner: REFERRAL_REWARD_OWNER,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Referral failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}