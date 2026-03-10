import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { ideAuthCodes } from "@/lib/db/schema";

export async function POST() {
  const code = randomBytes(20).toString("hex");
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await db.insert(ideAuthCodes).values({ code, expiresAt });

  return NextResponse.json({ code, expiresAt: expiresAt.toISOString() });
}
