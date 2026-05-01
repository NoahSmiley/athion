import Link from "next/link";
import { getArtifactsForRelease, listChannelReleases } from "@/lib/opendock/releases";
import { TARGET_LABELS, TARGET_ORDER, type TargetId, formatBytes } from "@/lib/opendock/targets";
import { DownloadPrimary } from "./download-primary";

export const metadata = { title: "Download Opendock" };
export const dynamic = "force-dynamic";

export default async function OpendockDownloadPage() {
  const [latest] = await listChannelReleases("stable", 1);
  if (!latest) {
    return (
      <>
        <h1>Download Opendock</h1>
        <p className="muted">No releases yet. Check back soon.</p>
        <p style={{ marginTop: 16 }}><Link href="/opendock">← About Opendock</Link></p>
      </>
    );
  }
  const artifacts = await getArtifactsForRelease(latest.id);
  const byTarget = new Map(artifacts.map((a) => [a.target, a] as const));

  const rows = TARGET_ORDER.map((t) => ({ target: t, artifact: byTarget.get(t) ?? null }));

  return (
    <>
      <h1>Download Opendock</h1>
      <p className="muted">Version {latest.version} · released {latest.pubDate.toLocaleDateString()}</p>

      <DownloadPrimary
        options={rows
          .filter((r) => r.artifact)
          .map((r) => ({
            target: r.target,
            label: TARGET_LABELS[r.target as TargetId],
            url: r.artifact!.installerUrl ?? r.artifact!.url,
            size: r.artifact!.sizeBytes,
          }))}
      />

      <h2>All platforms</h2>
      <table>
        <thead><tr><th>Platform</th><th>Installer</th><th>Size</th><th>SHA-256</th></tr></thead>
        <tbody>
          {rows.map(({ target, artifact }) => (
            <tr key={target}>
              <td>{TARGET_LABELS[target as TargetId]}</td>
              <td>{artifact ? <a href={artifact.installerUrl ?? artifact.url}>Download</a> : <span className="muted">—</span>}</td>
              <td>{artifact ? formatBytes(artifact.sizeBytes) : <span className="muted">—</span>}</td>
              <td>{artifact ? <code style={{ fontSize: 11 }}>{artifact.sha256.slice(0, 16)}…</code> : <span className="muted">—</span>}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {latest.notes && (
        <>
          <h2>Release notes</h2>
          <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit", margin: 0 }}>{latest.notes}</pre>
        </>
      )}

      <p style={{ marginTop: 16 }}>
        <Link href="/opendock/releases">All releases →</Link>
        {" · "}
        <Link href="/opendock">About Opendock</Link>
      </p>
    </>
  );
}
