import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/auth/oauth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const ideCode = searchParams.get("ide_code") ?? undefined;
  return NextResponse.redirect(getGoogleAuthUrl(ideCode));
}
