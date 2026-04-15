const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
type OAuthResult = { email: string; name: string; avatarUrl: string; providerId: string };

export function getGitHubAuthUrl(ideCode?: string): string {
  const p = new URLSearchParams({ client_id: process.env.GITHUB_CLIENT_ID!, redirect_uri: `${SITE}/auth/callback?provider=github`, scope: "user:email" });
  if (ideCode) p.set("state", `ide:${ideCode}`);
  return `https://github.com/login/oauth/authorize?${p}`;
}

export async function exchangeGitHubCode(code: string): Promise<OAuthResult> {
  const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ client_id: process.env.GITHUB_CLIENT_ID!, client_secret: process.env.GITHUB_CLIENT_SECRET!, code }),
  });
  const { access_token } = await tokenRes.json();
  if (!access_token) throw new Error("Failed to exchange GitHub code");

  const headers = { Authorization: `Bearer ${access_token}` };
  const userData = await fetch("https://api.github.com/user", { headers }).then((r) => r.json());

  let email = userData.email;
  if (!email) {
    const emails = await fetch("https://api.github.com/user/emails", { headers }).then((r) => r.json());
    email = emails.find((e: { primary: boolean; verified: boolean }) => e.primary && e.verified)?.email;
  }
  if (!email) throw new Error("No email from GitHub");

  return { email, name: userData.name || userData.login, avatarUrl: userData.avatar_url, providerId: String(userData.id) };
}

export function getGoogleAuthUrl(ideCode?: string): string {
  const p = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: `${SITE}/auth/callback?provider=google`, response_type: "code", scope: "openid email profile", access_type: "offline" });
  if (ideCode) p.set("state", `ide:${ideCode}`);
  return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
}

export async function exchangeGoogleCode(code: string): Promise<OAuthResult> {
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, code, grant_type: "authorization_code", redirect_uri: `${SITE}/auth/callback?provider=google` }),
  });
  const { access_token } = await tokenRes.json();
  if (!access_token) throw new Error("Failed to exchange Google code");

  const userData = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", { headers: { Authorization: `Bearer ${access_token}` } }).then((r) => r.json());
  if (!userData.email) throw new Error("No email from Google");

  return { email: userData.email, name: userData.name || userData.email.split("@")[0], avatarUrl: userData.picture || "", providerId: userData.id };
}
