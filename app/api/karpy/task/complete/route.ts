import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { TASKS, XP_PER_TASK, getMiningLevelFromXp } from "@/lib/karpy";
import { getWalletFromRequest, verifySignedRequest } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    if (!verifySignedRequest(req)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const wallet = getWalletFromRequest(req);
    const body = await req.json();
    const taskId = String(body.taskId || "");

    const task = TASKS.find((t) => t.id === taskId);
    if (!task) {
      return NextResponse.json({ error: "Invalid task" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { wallet } });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const existing = await db.taskCompletion.findUnique({
      where: {
        userId_taskId: {
          userId: user.id,
          taskId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Task already completed" }, { status: 400 });
    }

    const nextXp = user.miningXp + XP_PER_TASK;
    const newLevel = getMiningLevelFromXp(nextXp);

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        balance: { increment: task.reward },
        miningXp: nextXp,
        miningLevel: newLevel,
        taskCompletions: {
          create: {
            taskId,
            reward: task.reward,
          },
        },
      },
    });

    return NextResponse.json({
      ok: true,
      reward: task.reward,
      balance: updated.balance,
      miningXp: updated.miningXp,
      miningLevel: updated.miningLevel,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Task error" }, { status: 500 });
  }
}