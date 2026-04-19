import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      error: "Forgot password is temporarily disabled",
    },
    { status: 503 }
  );
}