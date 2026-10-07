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

    const { user } = auth;
    const now = new Date();

    const surprises = await prisma.surprise.findMany({
      orderBy: { unlockDate: "asc" },
      include: {
        creator: { select: { id: true, name: true, username: true } },
        receiver: { select: { id: true, name: true, username: true } },
      },
    });

    const sanitized = surprises.map((s) => {
      const isLocked = new Date(s.unlockDate) > now;
      const isRecipient = s.receiverId === user.id;

      if (isLocked && isRecipient) {
        return {
          ...s,
          content: "🎁 [LOCKED] A surprise is awaiting you. It will be revealed when the countdown ends!",
          isLocked: true,
        };
      }

      return {
        ...s,
        isLocked,
      };
    });

    return NextResponse.json({ surprises: sanitized });
  } catch (error) {
    console.error("Fetch surprises error:", error);
    return NextResponse.json({ error: "Failed to fetch surprises" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { user, partner } = auth;
    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 400 });
    }

    const { title, type, content, unlockDate } = await request.json();

    if (!title || !content || !unlockDate) {
      return NextResponse.json({ error: "Title, content, and unlock date are required" }, { status: 400 });
    }

    const surprise = await prisma.surprise.create({
      data: {
        title: title.trim(),
        type: type || "MESSAGE",
        content: content.trim(),
        creatorId: user.id,
        receiverId: partner.id,
        unlockDate: new Date(unlockDate),
      },
      include: {
        creator: { select: { name: true, username: true } },
      },
    });

    // Award XP (+30 XP)
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
        title: "🎁 A Mystery Surprise was Placed in the Vault!",
        message: `${user.name} hid a surprise for you! It will unlock on ${new Date(unlockDate).toLocaleDateString()}. ✨`,
        type: "SURPRISE",
      },
    });

    return NextResponse.json({ success: true, surprise });
  } catch (error) {
    console.error("Create surprise error:", error);
    return NextResponse.json({ error: "Failed to create surprise" }, { status: 500 });
  }
}
