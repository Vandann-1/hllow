import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateLevel } from "@/lib/relationship";

const VALID_STATUSES = ["ACTIVE", "IN_PROGRESS", "COMPLETED", "PERMANENTLY_ADOPTED"];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { status } = await request.json();
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const wishId = params.id;
    const wish = await prisma.wish.findUnique({
      where: { id: wishId },
      include: { createdBy: true, targetUser: true },
    });

    if (!wish) {
      return NextResponse.json({ error: "Wish not found" }, { status: 404 });
    }

    const oldStatus = wish.status;
    const isNowCompleted = status === "COMPLETED" || status === "PERMANENTLY_ADOPTED";
    const wasCompleted = oldStatus === "COMPLETED" || oldStatus === "PERMANENTLY_ADOPTED";

    let xpDelta = 0;
    if (!wasCompleted && status === "COMPLETED") xpDelta = 50;
    else if (!wasCompleted && status === "PERMANENTLY_ADOPTED") xpDelta = 75;
    else if (wasCompleted && !isNowCompleted) xpDelta = -50;

    const updatedWish = await prisma.wish.update({
      where: { id: wishId },
      data: {
        status,
        completedAt: isNowCompleted ? new Date() : null,
      },
    });

    // Update couple settings & level
    let coupleSettings = await prisma.coupleSettings.findUnique({ where: { id: "couple" } });
    if (coupleSettings) {
      const newXp = Math.max(0, coupleSettings.xp + xpDelta);
      const levelData = calculateLevel(newXp);
      coupleSettings = await prisma.coupleSettings.update({
        where: { id: "couple" },
        data: {
          xp: newXp,
          level: levelData.level,
        },
      });
    }

    // Create notification
    const prettyStatus =
      status === "PERMANENTLY_ADOPTED"
        ? "Permanently Adopted 🌱"
        : status === "COMPLETED"
        ? "Completed 🎉"
        : status === "IN_PROGRESS"
        ? "In Progress ✨"
        : "Active";

    await prisma.notification.create({
      data: {
        title: `Wish Updated: #${wish.order.toString().padStart(2, "0")}`,
        message: `"${wish.title}" marked as ${prettyStatus}`,
        type: "WISH",
      },
    });

    return NextResponse.json({
      success: true,
      wish: updatedWish,
      coupleSettings,
    });
  } catch (error) {
    console.error("Update wish status error:", error);
    return NextResponse.json({ error: "Failed to update wish status" }, { status: 500 });
  }
}
