import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const auth = await getCurrentUser();
    if (!auth) {
      return NextResponse.json({ authenticated: false }, { status: 401 });
    }

    const coupleSettings = await prisma.coupleSettings.findUnique({
      where: { id: "couple" },
    });

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
      partner: auth.partner,
      coupleSettings,
    });
  } catch (error) {
    console.error("Auth check error:", error);
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
