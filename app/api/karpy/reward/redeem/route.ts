import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

const REWARDS = [
  { id: "1", name: "£1 Reward", cost: 10000 },
  { id: "2", name: "£5 Reward", cost: 50000 },
  { id: "3", name: "£10 Reward", cost: 100000 },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const wallet = String(body.wallet || "").toLowerCase();
    const rewardId = String(body.rewardId || "");

    const reward = REWARDS.find(r => r.id === rewardId);
    if (!reward) {
      return NextResponse.json({ error: "Invalid reward" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { wallet } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.balance < reward.cost) {
      return NextResponse.json({ error: "Not enough KPY" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { wallet },
      data: {
        balance: { decrement: reward.cost },
      },
    });

    return NextResponse.json({
      ok: true,
      message: `Redeemed ${reward.name}`,
      balance: updated.balance,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}