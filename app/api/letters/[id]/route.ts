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

    const { reaction, markRead } = await request.json();
    const updateData: { reaction?: string; isRead?: boolean; readAt?: Date } = {};

    if (reaction !== undefined) updateData.reaction = reaction;
    if (markRead) {
      updateData.isRead = true;
      updateData.readAt = new Date();
    }

    const letter = await prisma.loveLetter.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, letter });
  } catch (error) {
    console.error("Update letter error:", error);
    return NextResponse.json({ error: "Failed to update letter" }, { status: 500 });
  }
}
