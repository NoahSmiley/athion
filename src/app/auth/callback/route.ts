import { NextResponse } from "next/server";
import { eq, or, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { exchangeGitHubCode, exchangeGoogleCode } from "@/lib/auth/oauth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const provider = searchParams.get("provider");
  const code = searchParams.get("code");

  if (!code || !provider) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  try {
    let oauthUser: { email: string; name: string; avatarUrl: string; providerId: string };

    if (provider === "github") {
      oauthUser = await exchangeGitHubCode(code);
    } else if (provider === "google") {
      oauthUser = await exchangeGoogleCode(code);
    } else {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    // Find existing user by OAuth provider+id or by email
    const [existing] = await db
      .select()
      .from(users)
      .where(
        or(
          and(
            eq(users.oauthProvider, provider),
            eq(users.oauthProviderId, oauthUser.providerId)
          ),
          eq(users.email, oauthUser.email.toLowerCase())
        )
      )
      .limit(1);

    let userId: string;

    if (existing) {
      userId = existing.id;
      // Update OAuth fields if they weren't set (e.g. user signed up with email, now linking OAuth)
      if (!existing.oauthProvider) {
        await db
          .update(users)
          .set({
            oauthProvider: provider,
            oauthProviderId: oauthUser.providerId,
            avatarUrl: existing.avatarUrl || oauthUser.avatarUrl,
            updatedAt: new Date(),
          })
          .where(eq(users.id, existing.id));
      }
    } else {
      // Create new user
      const [newUser] = await db
        .insert(users)
        .values({
          email: oauthUser.email.toLowerCase(),
          displayName: oauthUser.name,
          avatarUrl: oauthUser.avatarUrl,
          oauthProvider: provider,
          oauthProviderId: oauthUser.providerId,
        })
        .returning();
      userId = newUser.id;
    }

    const token = await signToken(userId);
    await setSessionCookie(token);

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }
}
