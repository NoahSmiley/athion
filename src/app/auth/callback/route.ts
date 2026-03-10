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
  } catch (err) {
    console.error("OAuth callback error:", err);
    const errorRedirect = ideCode ? `/auth/ide-login?error=auth` : `/login?error=auth`;
    return NextResponse.redirect(`${origin}${errorRedirect}`);
  }
}

async function findOrCreateUser(
  provider: string,
  oauthUser: { email: string; name: string; avatarUrl: string; providerId: string },
): Promise<string> {
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

  if (existing) {
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
    return existing.id;
  }

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
  return newUser.id;
}
