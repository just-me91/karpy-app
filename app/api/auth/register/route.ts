import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import crypto from "crypto";

function makeWalletId() {
  return `user-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function makeReferralCodeCandidate() {
  return `KARPY-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

async function generateUniqueReferralCode() {
  for (let i = 0; i < 20; i++) {
    const code = makeReferralCodeCandidate();

    const existing = await db.user.findFirst({
      where: { referralCode: code },
      select: { id: true },
    });

    if (!existing) {
      return code;
    }
  }

  throw new Error("Failed to generate unique referral code");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const username = String(body.username || "").trim().toLowerCase();
    const password = String(body.password || "");
    const wallet = String(body.wallet || makeWalletId()).trim().toLowerCase();

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    const existingUsername = await db.user.findFirst({
      where: { username },
      select: { id: true },
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const existingWallet = await db.user.findFirst({
      where: { wallet },
      select: { id: true },
    });

    if (existingWallet) {
      return NextResponse.json(
        { error: "Wallet already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);
    const referralCode = await generateUniqueReferralCode();

    const user = await db.user.create({
      data: {
        wallet,
        username,
        passwordHash,
        referralCode,
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

    await createSession(user.id);

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        username: user.username,
        wallet: user.wallet,
        referralCode: user.referralCode,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Register failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}