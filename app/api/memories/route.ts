import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { calculateLevel } from "@/lib/relationship";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memories = await prisma.memory.findMany({
      orderBy: { date: "asc" },
      include: {
        createdBy: { select: { name: true, username: true } },
      },
    });

    return NextResponse.json({ memories });
  } catch (error) {
    console.error("Fetch memories error:", error);
    return NextResponse.json({ error: "Failed to fetch memories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, date, description, imageUrl, location, emoji = "❤️" } = await request.json();

    if (!title || !date || !description) {
      return NextResponse.json({ error: "Title, date, and description are required" }, { status: 400 });
    }

    const memory = await prisma.memory.create({
      data: {
        title: title.trim(),
        date: date.trim(),
        description: description.trim(),
        imageUrl: imageUrl?.trim() || null,
        location: location?.trim() || null,
        emoji: emoji || "❤️",
        createdById: auth.user.id,
      },
      include: {
        createdBy: { select: { name: true, username: true } },
      },
    });

    // Award couple XP for adding memory (+30 XP)
    let coupleSettings = await prisma.coupleSettings.findUnique({ where: { id: "couple" } });
    if (coupleSettings) {
      const newXp = coupleSettings.xp + 30;
      const levelData = calculateLevel(newXp);
      await prisma.coupleSettings.update({
        where: { id: "couple" },
        data: {
          xp: newXp,
          level: levelData.level,
        },
      });
    }

    await prisma.notification.create({
      data: {
        title: "📖 New Memory Added to Our Story",
        message: `${auth.user.name} added: "${title.trim()}". Cherish the moment! ✨`,
        type: "WISH",
      },
    });

    return NextResponse.json({ success: true, memory });
  } catch (error) {
    console.error("Add memory error:", error);
    return NextResponse.json({ error: "Failed to add memory" }, { status: 500 });
  }
}
