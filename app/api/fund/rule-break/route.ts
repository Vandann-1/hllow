import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { userId, wishId, amount = 100, reason, date } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: "Please select who broke the rule" }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Please provide a reason or note" }, { status: 400 });
    }

    const fineAmount = Number(amount) || 100;

    // Fetch couple settings to update streak & balance
    const coupleSettings = await prisma.coupleSettings.findUnique({
      where: { id: "couple" },
    });

    const currentStreak = coupleSettings?.currentStreak || 0;
    const bestStreak = coupleSettings?.bestStreak || 0;
    const newBestStreak = Math.max(bestStreak, currentStreak);

    // Create the transaction
    const transaction = await prisma.fundTransaction.create({
      data: {
        type: "RULE_BREAK",
        amount: fineAmount,
        userId,
        wishId: wishId || null,
        reason: reason.trim(),
        date: date ? new Date(date) : new Date(),
      },
      include: {
        user: { select: { name: true, username: true } },
        wish: { select: { order: true, title: true } },
      },
    });

    // Update couple settings: reset streak, add balance
    const updatedSettings = await prisma.coupleSettings.update({
      where: { id: "couple" },
      data: {
        fundBalance: { increment: fineAmount },
        currentStreak: 0,
        bestStreak: newBestStreak,
        lastStreakReset: new Date(),
      },
    });

    // Create notification
    const brokenPerson = transaction.user.name;
    const wishTitle = transaction.wish ? `Wish #${transaction.wish.order.toString().padStart(2, "0")} (${transaction.wish.title})` : "Relationship Rule";

    await prisma.notification.create({
      data: {
        title: "🚨 Rule Broken — Fine Added",
        message: `${brokenPerson} broke ${wishTitle}. ₹${fineAmount} added to the Relationship Fund. Streak reset to 0 days.`,
        type: "FUND",
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      coupleSettings: updatedSettings,
    });
  } catch (error) {
    console.error("Rule break record error:", error);
    return NextResponse.json({ error: "Failed to record rule break" }, { status: 500 });
  }
}
