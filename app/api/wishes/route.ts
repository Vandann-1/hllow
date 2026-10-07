import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET all relevant wishes
export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, partner } = auth;

    // Fetch wishes created by current user
    const myWishes = await prisma.wish.findMany({
      where: { createdById: user.id },
      orderBy: { order: "asc" },
      include: {
        createdBy: { select: { id: true, name: true, username: true } },
        targetUser: { select: { id: true, name: true, username: true } },
      },
    });

    // Fetch wishes created by partner
    let partnerWishes: typeof myWishes = [];
    if (partner) {
      if (partner.wishesLocked && user.wishesLocked) {
        // Both locked -> reveal all wishes!
        partnerWishes = await prisma.wish.findMany({
          where: { createdById: partner.id },
          orderBy: { order: "asc" },
          include: {
            createdBy: { select: { id: true, name: true, username: true } },
            targetUser: { select: { id: true, name: true, username: true } },
          },
        });
      }
    }

    return NextResponse.json({
      myWishes,
      partnerWishes,
      myCount: myWishes.length,
      myLocked: user.wishesLocked,
      partnerLocked: partner?.wishesLocked ?? false,
      bothLocked: user.wishesLocked && (partner?.wishesLocked ?? false),
    });
  } catch (error) {
    console.error("Fetch wishes error:", error);
    return NextResponse.json({ error: "Failed to fetch wishes" }, { status: 500 });
  }
}

// POST create wish
export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, partner } = auth;
    if (!partner) {
      return NextResponse.json({ error: "Partner account not found" }, { status: 400 });
    }

    if (user.wishesLocked) {
      return NextResponse.json({ error: "Your wishes are already locked and cannot be changed." }, { status: 400 });
    }

    const currentCount = await prisma.wish.count({
      where: { createdById: user.id },
    });

    if (currentCount >= 10) {
      return NextResponse.json({ error: "You have reached the maximum of 10 wishes." }, { status: 400 });
    }

    const { title, description, category } = await request.json();

    if (!title?.trim() || !description?.trim() || !category?.trim()) {
      return NextResponse.json({ error: "Title, description, and category are required." }, { status: 400 });
    }

    const newOrder = currentCount + 1;

    const wish = await prisma.wish.create({
      data: {
        order: newOrder,
        title: title.trim(),
        description: description.trim(),
        category: category.trim(),
        createdById: user.id,
        targetUserId: partner.id,
        isLocked: false,
        status: "ACTIVE",
      },
    });

    return NextResponse.json({
      success: true,
      wish,
      count: newOrder,
    });
  } catch (error) {
    console.error("Create wish error:", error);
    return NextResponse.json({ error: "Failed to create wish" }, { status: 500 });
  }
}

// DELETE wish (only before locking)
export async function DELETE(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user } = auth;
    if (user.wishesLocked) {
      return NextResponse.json({ error: "Wishes are locked and cannot be deleted." }, { status: 400 });
    }

    const { searchParams } = new URL(request.url);
    const wishId = searchParams.get("id");

    if (!wishId) {
      return NextResponse.json({ error: "Wish ID required" }, { status: 400 });
    }

    const wish = await prisma.wish.findUnique({
      where: { id: wishId },
    });

    if (!wish || wish.createdById !== user.id) {
      return NextResponse.json({ error: "Wish not found or not owned by you" }, { status: 404 });
    }

    await prisma.wish.delete({
      where: { id: wishId },
    });

    // Re-index orders for user's remaining wishes
    const remainingWishes = await prisma.wish.findMany({
      where: { createdById: user.id },
      orderBy: { createdAt: "asc" },
    });

    for (let i = 0; i < remainingWishes.length; i++) {
      await prisma.wish.update({
        where: { id: remainingWishes[i].id },
        data: { order: i + 1 },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete wish error:", error);
    return NextResponse.json({ error: "Failed to delete wish" }, { status: 500 });
  }
}
