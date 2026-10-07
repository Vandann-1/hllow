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

    const letters = await prisma.loveLetter.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        sender: { select: { id: true, name: true, username: true } },
        receiver: { select: { id: true, name: true, username: true } },
      },
    });

    // Sanitize letters if locked
    const sanitized = letters.map((l) => {
      const isLocked = l.unlockDate ? new Date(l.unlockDate) > now : false;
      const isRecipient = l.receiverId === user.id;

      if (isLocked && isRecipient) {
        return {
          ...l,
          content: "🔒 This love letter is locked and sealed until the special day arrives...",
          isLocked: true,
        };
      }

      return {
        ...l,
        isLocked,
      };
    });

    return NextResponse.json({ letters: sanitized });
  } catch (error) {
    console.error("Fetch letters error:", error);
    return NextResponse.json({ error: "Failed to fetch letters" }, { status: 500 });
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

    const { title, content, unlockDate } = await request.json();

    if (!title || !content) {
      return NextResponse.json({ error: "Title and letter content are required" }, { status: 400 });
    }

    const letter = await prisma.loveLetter.create({
      data: {
        title: title.trim(),
        content: content.trim(),
        senderId: user.id,
        receiverId: partner.id,
        unlockDate: unlockDate ? new Date(unlockDate) : null,
      },
      include: {
        sender: { select: { name: true, username: true } },
      },
    });

    // Award couple XP (+25 XP)
    let coupleSettings = await prisma.coupleSettings.findUnique({ where: { id: "couple" } });
    if (coupleSettings) {
      const newXp = coupleSettings.xp + 25;
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
        title: "💌 A New Love Letter For You",
        message: `${user.name} wrote you a letter: "${title.trim()}". Open it with love. ❤️`,
        type: "WISH",
      },
    });

    return NextResponse.json({ success: true, letter });
  } catch (error) {
    console.error("Send letter error:", error);
    return NextResponse.json({ error: "Failed to send letter" }, { status: 500 });
  }
}
