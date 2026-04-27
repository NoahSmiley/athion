import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { accessRequests } from "@/lib/db/schema";

export async function POST(request: Request) {
  try {
    const { email, github, vouchers } = await request.json();

    if (!email || !github) {
      return NextResponse.json({ error: "Email and GitHub are required" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const open = await db
      .select({ id: accessRequests.id, status: accessRequests.status })
      .from(accessRequests)
      .where(eq(accessRequests.email, normalizedEmail))
      .limit(1);

    const existing = open[0];
    if (existing && existing.status !== "denied") {
      return NextResponse.json({ id: existing.id }, { status: 200 });
    }

    const inserted = await db
      .insert(accessRequests)
      .values({
        email: normalizedEmail,
        githubUrl: String(github).trim(),
        vouchers: vouchers ? String(vouchers).trim() : null,
        status: "pending",
      })
      .returning({ id: accessRequests.id });

    return NextResponse.json({ id: inserted[0].id }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
