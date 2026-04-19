import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Password reset is temporarily disabled",
    },
    { status: 503 }
  );
}