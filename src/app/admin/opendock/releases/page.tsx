import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { opendockReleases, opendockReleaseArtifacts } from "@/lib/db/schema";
import { TARGET_LABELS, type TargetId } from "@/lib/opendock/targets";
import { NewReleaseForm } from "./new-release-form";
import { ReleaseRowActions } from "./release-row-actions";

export const dynamic = "force-dynamic";

export default async function AdminOpendockReleasesPage() {
  const releases = await db.select().from(opendockReleases).orderBy(desc(opendockReleases.pubDate)).limit(50);
  const artifactsByRelease = new Map<string, Awaited<ReturnType<typeof loadArtifacts>>>();
  for (const r of releases) {
    artifactsByRelease.set(r.id, await loadArtifacts(r.id));
  }

  return (
    <>
      <h1>Opendock releases</h1>
      <p className="muted">Each release lives at <code>/dl/opendock/&lt;version&gt;/...</code> on the host. Upload binaries via SCP, then register them here.</p>

      <h2>New release</h2>
      <NewReleaseForm />

      <h2 style={{ marginTop: 24 }}>Existing releases</h2>
      {releases.length === 0 && <p className="muted">No releases yet.</p>}
      {releases.map((r) => {
        const arts = artifactsByRelease.get(r.id) ?? [];
        return (
          <section key={r.id} style={{ margin: "16px 0", padding: 12, border: "1px solid #1a1a1a", borderRadius: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <strong>v{r.version}</strong>
                <span className="muted" style={{ marginLeft: 8, fontSize: 12 }}>{r.channel}{r.yanked ? " · yanked" : ""}</span>
              </div>
              <ReleaseRowActions id={r.id} yanked={r.yanked} />
            </div>
            <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>{r.pubDate.toISOString()}</p>
            {arts.length === 0
              ? <p className="muted" style={{ fontSize: 12 }}>No artifacts.</p>
              : (
                <ul style={{ fontSize: 12, marginTop: 6 }}>
                  {arts.map((a) => <li key={a.id}>{TARGET_LABELS[a.target as TargetId] ?? a.target} · {(a.sizeBytes / 1024 / 1024).toFixed(1)} MB</li>)}
                </ul>
              )}
          </section>
        );
      })}
    </>
  );
}

async function loadArtifacts(releaseId: string) {
  return db.select().from(opendockReleaseArtifacts).where(eq(opendockReleaseArtifacts.releaseId, releaseId));
}
