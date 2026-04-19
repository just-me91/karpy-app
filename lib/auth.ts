import crypto from "crypto";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const KARPY_SESSION_COOKIE = "karpy_session";

export function randomToken(size = 32) {
  return crypto.randomBytes(size).toString("hex");
}

export function makeSessionExpiry(days = 30) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

export async function createSession(userId: string) {
  const token = randomToken(32);
  const expiresAt = makeSessionExpiry(30);

  await db.karpySession.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(KARPY_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: expiresAt,
  });

  return { token, expiresAt };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(KARPY_SESSION_COOKIE)?.value;

  if (token) {
    await db.karpySession.deleteMany({
      where: { token },
    });
  }

  cookieStore.set(KARPY_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    expires: new Date(0),
  });
}

export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(KARPY_SESSION_COOKIE)?.value;

  if (!token) return null;

  const session = await db.karpySession.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.karpySession.deleteMany({
      where: { token },
    });
    return null;
  }

  return session.user;
}

export function getWalletFromRequest(req: NextRequest) {
  const headerWallet = req.headers.get("x-wallet");
  if (headerWallet) return headerWallet.trim().toLowerCase();
  return "";
}

export function verifySignedRequest(_req: NextRequest) {
  return true;
}