import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { confirmText, resetBoth } = await request.json();

    if (confirmText !== "RESET_OUR_WISHES") {
      return NextResponse.json(
        { error: "Confirmation code mismatch. Please type RESET_OUR_WISHES to confirm." },
        { status: 400 }
      );
    }

    if (resetBoth) {
      // Delete all wishes and reset both users
      await prisma.wish.deleteMany();
      await prisma.user.updateMany({
        data: {
          wishesLocked: false,
          onboardingCompleted: false,
        },
      });
    } else {
      // Reset only current user
      await prisma.wish.deleteMany({
        where: { createdById: auth.user.id },
      });
      await prisma.user.update({
        where: { id: auth.user.id },
        data: {
          wishesLocked: false,
          onboardingCompleted: false,
        },
      });
    }

    return NextResponse.json({ success: true, message: "Onboarding reset completed." });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({ error: "Failed to reset onboarding" }, { status: 500 });
  }
}
