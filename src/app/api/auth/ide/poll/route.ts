import { NextResponse } from "next/server";
import { eq, and, gt, isNull } from "drizzle-orm";
import { db } from "@/lib/db";
import { ideAuthCodes } from "@/lib/db/schema";

export async function POST(request: Request) {
  const { code } = await request.json();
  if (!code) return NextResponse.json({ error: "Missing code" }, { status: 400 });

  const [row] = await db
    .select()
    .from(ideAuthCodes)
    .where(
      and(
        eq(ideAuthCodes.code, code),
        gt(ideAuthCodes.expiresAt, new Date()),
      )
    )
    .limit(1);

  if (!row) return NextResponse.json({ status: "expired" }, { status: 410 });
  if (!row.token) return NextResponse.json({ status: "pending" });

  // Mark as used so it can't be polled again
  await db
    .update(ideAuthCodes)
    .set({ usedAt: new Date() })
    .where(and(eq(ideAuthCodes.id, row.id), isNull(ideAuthCodes.usedAt)));

  return NextResponse.json({ status: "complete", token: row.token });
}
