import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/auth/roles";
import { WAKE_TARGETS, sendMagicPacket } from "@/lib/wake";

export const runtime = "nodejs";

/** Wakes one of the rack PCs. Body: { target: "gaming" | "sam" }. */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await request.json().catch(() => null);
  const target = WAKE_TARGETS.find((t) => t.id === body?.target);
  if (!target) return NextResponse.json({ error: "Unknown PC" }, { status: 400 });

  try {
    await sendMagicPacket(target.mac);
  } catch {
    return NextResponse.json({ error: "Could not send the wake signal" }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
