import { NextResponse } from "next/server";
import { getGitHubAuthUrl } from "@/lib/auth/oauth";

export async function GET() {
  return NextResponse.redirect(getGitHubAuthUrl());
}
