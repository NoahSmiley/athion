import Link from "next/link";
import { getArtifactsForRelease, listChannelReleases } from "@/lib/opendock/releases";
import { TARGET_LABELS, TARGET_ORDER, type TargetId, formatBytes } from "@/lib/opendock/targets";

export const metadata = { title: "Opendock releases" };
export const dynamic = "force-dynamic";

export default async function OpendockReleasesPage() {
  const releases = await listChannelReleases("stable", 50);
  const withArtifacts = await Promise.all(
    releases.map(async (r) => ({ release: r, artifacts: await getArtifactsForRelease(r.id) })),
  );

  return (
    <>
      <h1>Opendock releases</h1>
      <p className="muted">Stable channel · {releases.length} {releases.length === 1 ? "release" : "releases"}</p>

      {releases.length === 0 && <p className="muted" style={{ marginTop: 12 }}>No releases yet.</p>}

      {withArtifacts.map(({ release, artifacts }) => {
        const byTarget = new Map(artifacts.map((a) => [a.target, a] as const));
        return (
          <section key={release.id} style={{ margin: "20px 0", paddingBottom: 16, borderBottom: "1px solid #1a1a1a" }}>
            <h2 style={{ marginTop: 0 }}>v{release.version}</h2>
            <p className="muted" style={{ marginTop: -4, fontSize: 12 }}>{release.pubDate.toLocaleDateString()}</p>
            {release.notes && (
              <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: "8px 0 12px", fontSize: 13 }}>{release.notes}</pre>
            )}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, fontSize: 12 }}>
              {TARGET_ORDER.map((t) => {
                const a = byTarget.get(t);
                if (!a) return null;
                return (
                  <a key={t} href={a.installerUrl ?? a.url}>
                    {TARGET_LABELS[t as TargetId]} · {formatBytes(a.sizeBytes)}
                  </a>
                );
              })}
            </div>
          </section>
        );
      })}

      <p style={{ marginTop: 16 }}>
        <Link href="/opendock/download">← Back to download</Link>
      </p>
    </>
  );
}
