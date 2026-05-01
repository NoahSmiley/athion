import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { opendockReleases, opendockReleaseArtifacts } from "@/lib/db/schema";
import { getAdminUser } from "@/lib/auth/roles";
import { isValidChannel, isValidTarget } from "@/lib/opendock/releases";
import { parseSemVer } from "@/lib/opendock/semver";

type ArtifactInput = {
  target: string;
  url: string;
  installerUrl: string | null;
  signature: string;
  sha256: string;
  sizeBytes: number;
};

interface Body {
  version?: string;
  channel?: string;
  notes?: string;
  artifacts?: ArtifactInput[];
}

export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await request.json().catch(() => ({}))) as Body;
  const version = (body.version ?? "").trim();
  const channel = (body.channel ?? "stable").trim();
  const notes = (body.notes ?? "").trim();
  const artifacts = body.artifacts ?? [];

  if (!parseSemVer(version)) return NextResponse.json({ error: "Bad version" }, { status: 400 });
  if (!isValidChannel(channel)) return NextResponse.json({ error: "Bad channel" }, { status: 400 });
  if (artifacts.length === 0) return NextResponse.json({ error: "At least one artifact required" }, { status: 400 });

  for (const a of artifacts) {
    if (!isValidTarget(a.target)) return NextResponse.json({ error: `Bad target ${a.target}` }, { status: 400 });
    if (!a.url || !a.signature || !a.sha256 || !Number.isFinite(a.sizeBytes) || a.sizeBytes <= 0) {
      return NextResponse.json({ error: `Incomplete artifact for ${a.target}` }, { status: 400 });
    }
    if (!/^[0-9a-f]{64}$/i.test(a.sha256)) return NextResponse.json({ error: `Bad sha256 for ${a.target}` }, { status: 400 });
  }

  const seen = new Set<string>();
  for (const a of artifacts) {
    if (seen.has(a.target)) return NextResponse.json({ error: `Duplicate target ${a.target}` }, { status: 400 });
    seen.add(a.target);
  }

  let release;
  try {
    [release] = await db.insert(opendockReleases).values({
      version, channel, notes, createdBy: admin.id,
    }).returning();
  } catch (e) {
    // Postgres unique_violation on (version, channel). Drizzle wraps pg errors,
    // so the code can sit on either the thrown value or its `cause`.
    const wrapped = e as { code?: string; cause?: { code?: string } };
    const code = wrapped.code ?? wrapped.cause?.code;
    if (code === "23505") return NextResponse.json({ error: "Version already exists on this channel" }, { status: 409 });
    throw e;
  }

  await db.insert(opendockReleaseArtifacts).values(artifacts.map((a) => ({
    releaseId: release.id,
    target: a.target,
    url: a.url,
    installerUrl: a.installerUrl,
    signature: a.signature,
    sha256: a.sha256,
    sizeBytes: a.sizeBytes,
  })));

  return NextResponse.json({ id: release.id, version: release.version }, { status: 201 });
}
