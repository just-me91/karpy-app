import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getWalletFromRequest, verifySignedRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    if (!verifySignedRequest(req)) {
      return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
    }

    const wallet = getWalletFromRequest(req);
    const body = await req.json().catch(() => ({}));
    const code = String(body.code || "").trim();

    if (!wallet) {
      return NextResponse.json({ ok: false, error: "Missing wallet header" }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json({ ok: false, error: "Missing referral code" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { wallet },
    });

    if (!user) {
      return NextResponse.json({ ok: false, error: "User not found" }, { status: 400 });
    }

    if (user.referredBy) {
      return NextResponse.json({ ok: false, error: "Referral already used" }, { status: 400 });
    }

    const referrer = await db.user.findUnique({
      where: { referralCode: code },
    });

    if (!referrer) {
      return NextResponse.json({ ok: false, error: "Invalid referral code" }, { status: 400 });
    }

    if (referrer.wallet === wallet) {
      return NextResponse.json({ ok: false, error: "You cannot refer yourself" }, { status: 400 });
    }

    await db.$transaction([
      db.user.update({
        where: { wallet },
        data: {
          referredBy: code,
        },
      }),
      db.user.update({
        where: { id: referrer.id },
        data: {
          referrals: { increment: 1 },
          balance: { increment: 1500 },
        },
      }),
    ]);

    const updatedUser = await db.user.findUnique({
      where: { wallet },
    });

    const updatedReferrer = await db.user.findUnique({
      where: { id: referrer.id },
    });

    return NextResponse.json({
      ok: true,
      message: "Referral applied successfully.",
      userWallet: wallet,
      usedCode: code,
      userBalance: updatedUser?.balance ?? 0,
      referrerWallet: referrer.wallet,
      referrerBalance: updatedReferrer?.balance ?? 0,
      referrerReferrals: updatedReferrer?.referrals ?? 0,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || "Referral error",
      },
      { status: 500 }
    );
  }
}