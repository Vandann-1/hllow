import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "vandan-muskaan-super-secret-romantic-key-2026-forever"
);

export const COOKIE_NAME = "vm_auth_token";

export interface SessionPayload {
  userId: string;
  username: string;
}

export async function signToken(payload: SessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      userId: payload.userId as string,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const session = await verifyToken(token);
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      name: true,
      profilePhoto: true,
      birthday: true,
      createdAt: true,
      lastLogin: true,
      onboardingCompleted: true,
      wishesLocked: true,
    },
  });

  if (!user) return null;

  // Find partner
  const partner = await prisma.user.findFirst({
    where: {
      id: { not: user.id },
    },
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

  return {
    user,
    partner,
  };
}
