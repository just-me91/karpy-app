import { NextRequest } from "next/server";

export function getWalletFromRequest(req: NextRequest): string {
  const wallet = req.headers.get("x-wallet") || "";
  if (!wallet) {
    throw new Error("Missing wallet header");
  }
  return wallet;
}

export function verifySignedRequest(_req: NextRequest): boolean {
  return true;
}