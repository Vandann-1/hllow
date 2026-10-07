import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const surprise = await prisma.surprise.update({
      where: { id: params.id },
      data: {
        isOpened: true,
        openedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, surprise });
  } catch (error) {
    console.error("Open surprise error:", error);
    return NextResponse.json({ error: "Failed to update surprise" }, { status: 500 });
  }
}
