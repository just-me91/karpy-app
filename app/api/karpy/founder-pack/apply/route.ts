import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { FOUNDER_PACKS } from "@/lib/karpy";
import { getSessionUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const packId = String(body.packId || "");

    const pack = FOUNDER_PACKS.find((p) => p.id === packId);

    if (!pack) {
      return NextResponse.json({ error: "Invalid founder pack" }, { status: 400 });
    }

    const existing = await db.founderPackPurchase.findFirst({
      where: {
        userId: user.id,
        packId,
      },
    });

    if (existing) {
      return NextResponse.json({ error: "Pack already purchased" }, { status: 400 });
    }

    if (user.balance < pack.cost) {
      return NextResponse.json(
        { error: `Not enough KPY. Need ${pack.cost}` },
        { status: 400 }
      );
    }

    const premiumBase =
      user.premiumExpiresAt && new Date(user.premiumExpiresAt).getTime() > Date.now()
        ? new Date(user.premiumExpiresAt).getTime()
        : Date.now();

    const boostBase =
      user.boostExpiresAt && new Date(user.boostExpiresAt).getTime() > Date.now()
        ? new Date(user.boostExpiresAt).getTime()
        : Date.now();

    const premiumExpiresAt = new Date(
      premiumBase + pack.premiumDays * 24 * 60 * 60 * 1000
    );

    const boostExpiresAt = new Date(
      boostBase + pack.boostHours * 60 * 60 * 1000
    );

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        balance: {
          decrement: pack.cost,
        },
        isPremium: true,
        premiumExpiresAt,
        boostMultiplier: pack.boostMultiplier,
        boostExpiresAt,
        balance: {
          decrement: pack.cost,
        },
        founderPacks: {
          create: {
            packId: pack.id,
            cost: pack.cost,
          },
        },
      },
    });

    await db.user.update({
      where: { id: user.id },
      data: {
        balance: {
          increment: pack.rewardBalance,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      message: `${pack.title} activated`,
      balance: updated.balance - pack.cost + pack.rewardBalance,
      premiumExpiresAt,
      boostExpiresAt,
    });
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Founder pack failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}