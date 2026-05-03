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
    <div className="tall-page">
      <h1>Software</h1>
      <p className="muted">Products we build and ship. Local-first, lean, and crafted for the long term.</p>

      <div style={{ marginTop: 24, border: "1px solid #2a2a2a", padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.2 }}>Opendock</h2>
          {latest && (
            <span style={{ fontSize: 11, color: "#828282", fontFamily: "var(--font-mono)" }}>
              v{latest.version}
            </span>
          )}
        </div>

        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.55, color: "#c8c8c8" }}>
          Native desktop workspace — kanban, notes, calendar, AI. Local-first, 30 MB RAM.
        </p>

        <div style={{ marginTop: 18, display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", fontSize: 13 }}>
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
