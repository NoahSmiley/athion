import { NextResponse } from "next/server";
import { eq, inArray, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";
import { getSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ subscriptions: [] });
    }

    const subs = await db
      .select()
      .from(subscriptions)
      .where(
        and(
          eq(subscriptions.userId, user.id),
          inArray(subscriptions.status, ["active", "trialing"])
        )
      );

    return NextResponse.json({ subscriptions: subs });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
