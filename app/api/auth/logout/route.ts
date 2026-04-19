import { NextResponse } from "next/server";
import { destroySession } from "@/lib/auth";

export async function POST() {
  try {
    await destroySession();
    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Logout failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}