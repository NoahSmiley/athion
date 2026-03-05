import { NextResponse } from "next/server";
import { getGoogleAuthUrl } from "@/lib/auth/oauth";

export async function GET() {
  return NextResponse.redirect(getGoogleAuthUrl());
}
