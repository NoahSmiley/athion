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

const featurePills = ["Boards", "Notes", "Calendar", "AI", "Local-first", "Offline"];

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
    <div className="tall-page">
      <h1>Software</h1>
      <p className="muted">Products we build and ship. Local-first, lean, and crafted for the long term.</p>

      <div style={{ marginTop: 24, border: "1px solid #2a2a2a", padding: "24px 26px" }}>
        {/* Header row: mark + title left, status pill right */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <span
            aria-hidden
            style={{
              width: 22,
              height: 22,
              border: "1px solid #3a3a3a",
              borderRadius: 4,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "var(--font-mono)",
              fontSize: 13,
              fontWeight: 600,
              color: "#c8c8c8",
              lineHeight: 1,
            }}
          >
            O
          </span>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 600, letterSpacing: -0.2 }}>Opendock</h2>
          {latest && (
            <span style={{ fontSize: 11, color: "#828282", fontFamily: "var(--font-mono)" }}>
              v{latest.version}
            </span>
          )}
        </div>

        <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: "#c8c8c8" }}>
          Kanban boards, rich notes, calendar, and Claude AI in a single native desktop app.
          SQLite on your machine. No cloud, no Electron, no telemetry.
        </p>

        {/* Headline stat — the brag */}
        <div style={{ marginTop: 18, padding: "12px 14px", border: "1px solid #1f1f1f", background: "#0a0a0a", fontFamily: "var(--font-mono)", fontSize: 12, color: "#c8c8c8", display: "flex", gap: 24, flexWrap: "wrap" }}>
          <span><span className="muted">RAM idle</span> 30 MB</span>
          <span><span className="muted">Binary</span> 18 MB</span>
          <span><span className="muted">Startup</span> 0.4s</span>
          <span><span className="muted">Offline</span> 100%</span>
        </div>

        {/* Feature pills */}
        <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {featurePills.map((f) => (
            <span
              key={f}
              style={{
                fontSize: 11,
                color: "#828282",
                border: "1px solid #1f1f1f",
                padding: "3px 9px",
                borderRadius: 3,
              }}
            >
              {f}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div style={{ marginTop: 22, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", fontSize: 13 }}>
          {downloadOptions.length > 0 ? (
            <>
              <DownloadPrimary options={downloadOptions} />
              <Link href="/opendock" className="muted" style={{ fontSize: 12 }}>Learn more →</Link>
              <Link href="/pricing" className="muted" style={{ fontSize: 12 }}>Pricing</Link>
            </>
          ) : (
            <>
              <Link href="/opendock" className="cta-light" style={{ padding: "8px 16px", textDecoration: "none", fontWeight: 500, borderRadius: 6 }}>
                Open page →
              </Link>
              <Link href="/pricing" className="muted" style={{ fontSize: 12 }}>Pricing</Link>
            </>
          )}
        </div>
      </div>

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>
        More coming.
      </p>
    </div>
  );
}
