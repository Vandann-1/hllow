import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, partner } = auth;

    const count = await prisma.wish.count({
      where: { createdById: user.id },
    });

    if (count < 10) {
      return NextResponse.json(
        { error: `You need exactly 10 wishes before locking. Currently you have ${count}/10.` },
        { status: 400 }
      );
    }

    // Lock all user's wishes
    await prisma.wish.updateMany({
      where: { createdById: user.id },
      data: { isLocked: true },
    });

    // Mark user as locked and onboarding completed
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        wishesLocked: true,
        onboardingCompleted: true,
      },
    });

    // Check if partner also locked
    const partnerFresh = await prisma.user.findUnique({
      where: { id: partner?.id || "" },
      select: { wishesLocked: true, name: true },
    });

    const bothLocked = Boolean(partnerFresh?.wishesLocked);

    if (bothLocked) {
      // Award couple XP for sealing the rulebook
      await prisma.coupleSettings.update({
        where: { id: "couple" },
        data: {
          xp: { increment: 150 },
        },
      });

      await prisma.notification.create({
        data: {
          title: "🎉 Rulebook Sealed!",
          message: "All 20 wishes are locked. Your relationship game begins! ❤️",
          type: "WISH",
        },
      });
    }

    return NextResponse.json({
      success: true,
      wishesLocked: true,
      bothLocked,
      partnerLocked: partnerFresh?.wishesLocked ?? false,
    });
  } catch (error) {
    console.error("Lock wishes error:", error);
    return NextResponse.json({ error: "Failed to lock wishes" }, { status: 500 });
  }
}
