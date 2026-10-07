import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  return NextResponse.json(
    {
      error:
        "Direct account switching is strictly disabled. Each partner must log out and authenticate with their own password.",
    },
    { status: 403 }
  );
}

