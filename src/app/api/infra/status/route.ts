import { NextResponse } from "next/server";
import { getZomboidStatus, getMinecraftStatus } from "@/lib/infra/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [zomboid, minecraft] = await Promise.all([
    getZomboidStatus(),
    getMinecraftStatus(),
  ]);
  return NextResponse.json({ zomboid, minecraft });
}
