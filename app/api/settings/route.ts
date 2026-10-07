import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

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

    return NextResponse.json({
      user: auth.user,
      partner: auth.partner,
      coupleSettings,
    });
  } catch (error) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { profilePhoto, birthday, newPassword, relationshipStartDate } = await request.json();

    const userUpdate: { profilePhoto?: string; birthday?: string; password?: string } = {};

    if (profilePhoto !== undefined) userUpdate.profilePhoto = profilePhoto;
    if (birthday !== undefined) userUpdate.birthday = birthday;
    if (newPassword && newPassword.trim().length >= 4) {
      userUpdate.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    if (Object.keys(userUpdate).length > 0) {
      await prisma.user.update({
        where: { id: auth.user.id },
        data: userUpdate,
      });
    }

    if (relationshipStartDate) {
      await prisma.coupleSettings.update({
        where: { id: "couple" },
        data: { relationshipStartDate },
      });
    }

    return NextResponse.json({ success: true, message: "Settings updated successfully" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
