import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { hashPassword } from "@/lib/password";
import { makeReferralCode } from "@/lib/karpy";

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const username = String(body.username || "").trim().toLowerCase();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const wallet = String(body.wallet || `user-${Date.now()}`).trim().toLowerCase();

    if (!username || username.length < 3) {
      return NextResponse.json(
        { error: "Username must be at least 3 characters" },
        { status: 400 }
      );
    }

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: "Valid email required" },
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
    });

    if (existingUsername) {
      return NextResponse.json(
        { error: "Username already exists" },
        { status: 400 }
      );
    }

    const existingEmail = await db.user.findFirst({
      where: { email },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    const user = await db.user.create({
      data: {
        wallet,
        username,
        email,
        passwordHash,
        referralCode: makeReferralCode(wallet),
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
        email: user.email,
        wallet: user.wallet,
      },
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Register failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}