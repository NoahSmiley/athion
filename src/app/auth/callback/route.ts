import { NextResponse } from "next/server";
import { eq, or, and, gt } from "drizzle-orm";
import { db } from "@/lib/db";
import { users, ideAuthCodes } from "@/lib/db/schema";
import { signToken } from "@/lib/auth/jwt";
import { setSessionCookie } from "@/lib/auth/session";
import { exchangeGitHubCode, exchangeGoogleCode } from "@/lib/auth/oauth";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const provider = searchParams.get("provider");
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !provider) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  // Check if this is an IDE login flow
  const ideCode = state?.startsWith("ide:") ? state.slice(4) : null;

  try {
    let oauthUser: { email: string; name: string; avatarUrl: string; providerId: string };

    if (provider === "github") {
      oauthUser = await exchangeGitHubCode(code);
    } else if (provider === "google") {
      oauthUser = await exchangeGoogleCode(code);
    } else {
      return NextResponse.redirect(`${origin}/login?error=auth`);
    }

    const userId = await findOrCreateUser(provider, oauthUser);
    const token = await signToken(userId);

    // IDE flow: stamp the auth code and redirect to success page
    if (ideCode) {
      await db
        .update(ideAuthCodes)
        .set({ userId, token })
        .where(
          and(
            eq(ideAuthCodes.code, ideCode),
            gt(ideAuthCodes.expiresAt, new Date()),
          )
        );
      return NextResponse.redirect(`${origin}/auth/ide-success`);
    }

    // Normal web flow
    await setSessionCookie(token);
    return NextResponse.redirect(`${origin}/dashboard`);
  } catch {
    return NextResponse.redirect(`${origin}${ideCode ? "/auth/ide-login?error=auth" : "/login?error=auth"}`);
  }
}

type OAuthUser = { email: string; name: string; avatarUrl: string; providerId: string };

async function findOrCreateUser(provider: string, u: OAuthUser): Promise<string> {
  const [existing] = await db.select().from(users)
    .where(or(and(eq(users.oauthProvider, provider), eq(users.oauthProviderId, u.providerId)), eq(users.email, u.email.toLowerCase())))
    .limit(1);
  if (existing) {
    if (!existing.oauthProvider) {
      await db.update(users).set({ oauthProvider: provider, oauthProviderId: u.providerId, avatarUrl: existing.avatarUrl || u.avatarUrl, updatedAt: new Date() }).where(eq(users.id, existing.id));
    }
    return existing.id;
  }
  const [created] = await db.insert(users).values({ email: u.email.toLowerCase(), displayName: u.name, avatarUrl: u.avatarUrl, oauthProvider: provider, oauthProviderId: u.providerId }).returning();
  return created.id;
}
