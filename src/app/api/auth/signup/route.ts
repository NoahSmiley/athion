import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Signup is invite-only. Request access at /request-access." },
    { status: 503 },
  );
}
