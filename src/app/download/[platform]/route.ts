import { NextRequest, NextResponse } from "next/server";
import { eq, inArray, and } from "drizzle-orm";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db";
import { subscriptions } from "@/lib/db/schema";

const REPO = "NoahSmiley/fluxchat";

const ASSET_PATTERNS: Record<string, RegExp> = {
  windows: /\.exe$/,
  mac: /\.dmg$/,
};

async function getRelease(beta: boolean) {
  // For stable: fetch latest non-prerelease. For beta: fetch latest prerelease.
  const url = beta
    ? `https://api.github.com/repos/${REPO}/releases`
    : `https://api.github.com/repos/${REPO}/releases/latest`;

  const res = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) return null;

  if (beta) {
    const releases = await res.json();
    return releases.find((r: { prerelease: boolean }) => r.prerelease) ?? null;
  }

  return res.json();
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> },
) {
  // Require active subscription to download
  const user = await getSession();
  if (!user) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  const subs = await db
    .select({ product: subscriptions.product })
    .from(subscriptions)
    .where(
      and(
        eq(subscriptions.userId, user.id),
        inArray(subscriptions.status, ["active", "trialing"])
      )
    );

  const hasSubscription = subs.some(
    (s) => s.product === "athion_pro" || s.product === "athion"
  );

  if (!hasSubscription) {
    return NextResponse.json(
      { error: "Active subscription required to download Flux." },
      { status: 403 },
    );
  }

  const { platform } = await params;
  const beta = req.nextUrl.searchParams.get("beta") === "true";

  const pattern = ASSET_PATTERNS[platform];
  if (!pattern) {
    return NextResponse.json(
      { error: `Unknown platform: ${platform}. Use "windows" or "mac".` },
      { status: 400 },
    );
  }

  const release = await getRelease(beta);
  if (!release) {
    return NextResponse.json({ error: "No release found" }, { status: 404 });
  }

  // Match the asset whose name contains the release version to avoid stale duplicates
  const version = (release.tag_name as string)?.replace(/^v/, "");
  const assets = (release.assets ?? []) as { name: string; browser_download_url: string }[];
  const asset =
    assets.find((a) => pattern.test(a.name) && version && a.name.includes(version)) ??
    assets.findLast((a) => pattern.test(a.name));

  if (!asset) {
    return NextResponse.json(
      { error: `No ${platform} installer found in ${release.tag_name}` },
      { status: 404 },
    );
  }

  return NextResponse.redirect(asset.browser_download_url, 302);
}
