import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getUpcomingDates } from "@/lib/relationship";

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

    const startDate = coupleSettings?.relationshipStartDate || "2026-10-07";

    const allDates = await prisma.specialDate.findMany({
      orderBy: { date: "asc" },
    });

    const upcoming = getUpcomingDates(allDates, startDate);

    // Group by categories
    const categories = {
      BIRTHDAY: allDates.filter((d) => d.category === "BIRTHDAY"),
      RELATIONSHIP: allDates.filter((d) => d.category === "RELATIONSHIP"),
      LOVE_DAY: allDates.filter((d) => d.category === "LOVE_DAY"),
      FESTIVAL: allDates.filter((d) => d.category === "FESTIVAL"),
      CUSTOM: allDates.filter((d) => d.category === "CUSTOM"),
    };

    return NextResponse.json({
      startDate,
      allDates,
      upcoming,
      nearest: upcoming[0] || null,
      categories,
    });
  } catch (error) {
    console.error("Fetch dates error:", error);
    return NextResponse.json({ error: "Failed to fetch dates" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, date, category = "CUSTOM", emoji = "❤️", description } = await request.json();

    if (!title || !date) {
      return NextResponse.json({ error: "Title and date are required" }, { status: 400 });
    }

    const specialDate = await prisma.specialDate.create({
      data: {
        title: title.trim(),
        date: date.trim(),
        category,
        emoji,
        description: description?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, specialDate });
  } catch (error) {
    console.error("Add special date error:", error);
    return NextResponse.json({ error: "Failed to add special date" }, { status: 500 });
  }
}
