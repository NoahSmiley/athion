import type { Metadata } from "next";
import Link from "next/link";
import { getArtifactsForRelease, listChannelReleases } from "@/lib/opendock/releases";
import { TARGET_LABELS, type TargetId } from "@/lib/opendock/targets";
import { DownloadPrimary } from "../opendock/download/download-primary";

export const metadata: Metadata = {
  title: "Software",
  description: "Software products from Athion.",
};

export const dynamic = "force-dynamic";

export default async function SoftwarePage() {
  const [latest] = await listChannelReleases("stable", 1);
  const artifacts = latest ? await getArtifactsForRelease(latest.id) : [];
  const downloadOptions = artifacts.map((a) => ({
    target: a.target,
    label: TARGET_LABELS[a.target as TargetId],
    url: a.installerUrl ?? a.url,
    size: a.sizeBytes,
  }));

  return (
    <>
      <h1>Software</h1>
      <p className="muted">Products we build and ship. Local-first, lean, and crafted for the long term.</p>

      <div style={{ marginTop: 24, border: "1px solid #2a2a2a", padding: "20px 22px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
          <h2 style={{ margin: 0, fontSize: 18 }}>Opendock</h2>
          <span className="muted" style={{ fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase" }}>
            Active{latest ? ` · v${latest.version}` : ""}
          </span>
        </div>
        <p style={{ marginTop: 8, marginBottom: 0, fontSize: 14, lineHeight: 1.55 }}>
          Kanban boards, rich notes, calendar, and Claude AI in a single native desktop app.
          SQLite on your machine. No cloud, no Electron, no telemetry.
        </p>

        <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 18px", fontSize: 12 }}>
          <span className="muted">Boards</span><span>kanban with sprints, epics, drag-and-drop</span>
          <span className="muted">Notes</span><span>markdown editor, collections, tags</span>
          <span className="muted">Calendar</span><span>events linked to tickets and sprints</span>
          <span className="muted">AI</span><span>Claude assistant aware of your data</span>
          <span className="muted">Footprint</span><span>30 MB RAM idle, 18 MB binary</span>
          <span className="muted">Offline</span><span>100% — works without a network</span>
        </div>

        {downloadOptions.length > 0 ? (
          <div style={{ marginTop: 18, display: "flex", gap: 14, alignItems: "center", fontSize: 13, flexWrap: "wrap" }}>
            <DownloadPrimary options={downloadOptions} />
            <Link href="/opendock" className="muted">Learn more</Link>
            <Link href="/pricing" className="muted">Pricing</Link>
          </div>
        ) : (
          <div style={{ marginTop: 18, display: "flex", gap: 14, alignItems: "center", fontSize: 13 }}>
            <Link href="/opendock" className="cta-light" style={{ padding: "6px 14px", textDecoration: "none", fontWeight: 500 }}>
              Open page →
            </Link>
            <Link href="/pricing" className="muted">Pricing</Link>
          </div>
        )}
      </div>

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>
        More coming.
      </p>
    </>
  );
}
