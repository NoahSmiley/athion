const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// GitHub OAuth
export function getGitHubAuthUrl(ideCode?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID!,
    redirect_uri: `${SITE_URL}/auth/callback?provider=github`,
    scope: "user:email",
  });
  if (ideCode) params.set("state", `ide:${ideCode}`);
  return `https://github.com/login/oauth/authorize?${params}`;
}

export async function exchangeGitHubCode(code: string): Promise<{ email: string; name: string; avatarUrl: string; providerId: string }> {
  // Exchange code for access token
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      client_id: process.env.GITHUB_CLIENT_ID!,
      client_secret: process.env.GITHUB_CLIENT_SECRET!,
      code,
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    throw new Error("Failed to exchange GitHub code");
  }

  // Fetch user info
  const userRes = await fetch("https://api.github.com/user", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();

  // Fetch primary email if not public
  let email = userData.email;
  if (!email) {
    const emailsRes = await fetch("https://api.github.com/user/emails", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const emails = await emailsRes.json();
    const primary = emails.find((e: { primary: boolean; verified: boolean }) => e.primary && e.verified);
    email = primary?.email;
  }

  if (!email) throw new Error("No email found from GitHub");

  return {
    email,
    name: userData.name || userData.login,
    avatarUrl: userData.avatar_url,
    providerId: String(userData.id),
  };
}

// Google OAuth
export function getGoogleAuthUrl(ideCode?: string): string {
  const params = new URLSearchParams({
    client_id: process.env.GOOGLE_CLIENT_ID!,
    redirect_uri: `${SITE_URL}/auth/callback?provider=google`,
    response_type: "code",
    scope: "openid email profile",
    access_type: "offline",
  });
  if (ideCode) params.set("state", `ide:${ideCode}`);
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeGoogleCode(code: string): Promise<{ email: string; name: string; avatarUrl: string; providerId: string }> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${SITE_URL}/auth/callback?provider=google`,
    }),
  });
  const tokenData = await tokenRes.json();

  if (!tokenData.access_token) {
    throw new Error("Failed to exchange Google code");
  }

  const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  const userData = await userRes.json();

  if (!userData.email) throw new Error("No email found from Google");

  return {
    email: userData.email,
    name: userData.name || userData.email.split("@")[0],
    avatarUrl: userData.picture || "",
    providerId: userData.id,
  };
}
