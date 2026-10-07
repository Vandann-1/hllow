import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const coupleSettings = await prisma.coupleSettings.findUnique({
      where: { id: "couple" },
    });

    const transactions = await prisma.fundTransaction.findMany({
      orderBy: { date: "desc" },
      include: {
        user: { select: { id: true, name: true, username: true } },
        wish: { select: { id: true, order: true, title: true } },
      },
    });

    // Calculate contributions by person
    const users = await prisma.user.findMany({ select: { id: true, name: true, username: true } });
    const contributions: Record<string, { name: string; username: string; amount: number }> = {};
    for (const u of users) {
      contributions[u.id] = { name: u.name, username: u.username, amount: 0 };
    }

    let totalSpent = 0;
    let totalCollected = 0;

    for (const tx of transactions) {
      if (tx.type === "RULE_BREAK" || tx.type === "BONUS") {
        totalCollected += tx.amount;
        if (contributions[tx.userId]) {
          contributions[tx.userId].amount += tx.amount;
        }
      } else if (tx.type === "SPENT") {
        totalSpent += tx.amount;
      }
    }

    const calculatedBalance = Math.max(0, totalCollected - totalSpent);

    return NextResponse.json({
      balance: coupleSettings?.fundBalance ?? calculatedBalance,
      currentStreak: coupleSettings?.currentStreak ?? 0,
      bestStreak: coupleSettings?.bestStreak ?? 0,
      lastStreakReset: coupleSettings?.lastStreakReset,
      totalCollected,
      totalSpent,
      contributions: Object.values(contributions),
      transactions,
    });
  } catch (error) {
    console.error("Fund fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch fund data" }, { status: 500 });
  }
}
