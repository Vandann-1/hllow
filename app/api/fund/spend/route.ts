import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount, reason, category, date } = await request.json();

    const spendAmount = Number(amount);
    if (!spendAmount || spendAmount <= 0) {
      return NextResponse.json({ error: "Valid spend amount required" }, { status: 400 });
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json({ error: "Please enter where the fund was used" }, { status: 400 });
    }

    const coupleSettings = await prisma.coupleSettings.findUnique({
      where: { id: "couple" },
    });

    const currentBalance = coupleSettings?.fundBalance || 0;
    if (spendAmount > currentBalance) {
      return NextResponse.json(
        { error: `Insufficient fund balance. Current balance is ₹${currentBalance}.` },
        { status: 400 }
      );
    }

    const transaction = await prisma.fundTransaction.create({
      data: {
        type: "SPENT",
        amount: spendAmount,
        userId: auth.user.id,
        reason: reason.trim(),
        category: category || "Date",
        date: date ? new Date(date) : new Date(),
      },
      include: {
        user: { select: { name: true, username: true } },
      },
    });

    const updatedSettings = await prisma.coupleSettings.update({
      where: { id: "couple" },
      data: {
        fundBalance: { decrement: spendAmount },
      },
    });

    await prisma.notification.create({
      data: {
        title: "🥂 Fund Spent on a Memory!",
        message: `₹${spendAmount} spent on ${category || "Date"}: "${reason.trim()}". Enjoy your time! ❤️`,
        type: "FUND",
      },
    });

    return NextResponse.json({
      success: true,
      transaction,
      coupleSettings: updatedSettings,
    });
  } catch (error) {
    console.error("Fund spend error:", error);
    return NextResponse.json({ error: "Failed to record spend" }, { status: 500 });
  }
}
