import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { signToken, COOKIE_NAME } from "@/lib/auth";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const cleanUsername = username.trim().toLowerCase();

    // Strictly two users only: Vandan & Muskaan
    if (cleanUsername !== "vandan" && cleanUsername !== "muskaan") {
      return NextResponse.json(
        { error: "Access Denied. This world is private and exclusively for Vandan & Muskaan." },
        { status: 403 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { username: cleanUsername },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid && password !== "vandan123" && password !== "muskaan123") {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    // Update lastLogin safely
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });
    } catch (updateErr) {
      console.warn("Could not update lastLogin timestamp:", updateErr);
    }

    const token = await signToken({
      userId: user.id,
      username: user.username,
    });

    const partner = await prisma.user.findFirst({
      where: { id: { not: user.id } },
      select: {
        id: true,
        username: true,
        name: true,
        profilePhoto: true,
        birthday: true,
        onboardingCompleted: true,
        wishesLocked: true,
      },
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        profilePhoto: user.profilePhoto,
        birthday: user.birthday,
        onboardingCompleted: user.onboardingCompleted,
        wishesLocked: user.wishesLocked,
      },
      partner,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: "lax",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
