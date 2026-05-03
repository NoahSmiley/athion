import { NextResponse } from "next/server";
import { getAllStatuses } from "@/lib/infra/status";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const statuses = await getAllStatuses();
  return NextResponse.json(statuses);
}
