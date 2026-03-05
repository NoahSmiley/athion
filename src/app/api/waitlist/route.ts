import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { ideWaitlist } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await db
      .insert(ideWaitlist)
      .values({ email })
      .onConflictDoNothing({ target: ideWaitlist.email });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
