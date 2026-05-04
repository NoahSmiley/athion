import type { Metadata } from "next";
import Link from "next/link";
import { getArtifactsForRelease, listChannelReleases } from "@/lib/opendock/releases";
import { TARGET_LABELS, type TargetId } from "@/lib/opendock/targets";

export const metadata: Metadata = {
  title: "Software",
  description: "Software products from Athion.",
};

export const dynamic = "force-dynamic";

type ProductData = {
  slug: string;
  name: string;
  version?: string;
  tagline: string;
  capabilities: string[];
  footprint: string;
  downloadUrl?: string;
  downloadLabel?: string;
  downloadSize?: number;
  detailHref: string;
  pricingHref?: string;
};

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function SoftwarePage() {
  const [latest] = await listChannelReleases("stable", 1);
  const artifacts = latest ? await getArtifactsForRelease(latest.id) : [];
  const dl = artifacts.find((a) => a.target === "darwin-aarch64") ?? artifacts[0] ?? null;

  const products: ProductData[] = [
    {
      slug: "opendock",
      name: "Opendock",
      version: latest?.version,
      tagline: "Native desktop app for kanban boards and notes. Tauri shell over the Athion API.",
      capabilities: ["Boards", "Notes", "Links", "Sharing"],
      footprint: "16 MB binary · ~200 MB RAM in use (Tauri + WebKit)",
      downloadUrl: dl ? (dl.installerUrl ?? dl.url) : undefined,
      downloadLabel: dl ? TARGET_LABELS[dl.target as TargetId] : undefined,
      downloadSize: dl?.sizeBytes,
      detailHref: "/opendock",
      pricingHref: "/pricing",
    },
  ];

  return (
    <>
      <h1>Software</h1>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 22 }}>
        {products.map((p) => (
          <Link
            key={p.slug}
            href={p.detailHref}
            className="software-card"
            style={{ display: "block", border: "1px solid #1f1f1f", textDecoration: "none", color: "inherit" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                padding: "14px 18px",
                background: "#0a0a0a",
                borderBottom: "1px solid #1f1f1f",
              }}
            >
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
                <span style={{ color: "#fff", fontSize: 16, fontWeight: 600, letterSpacing: -0.2 }}>{p.name}</span>
                {p.version && (
                  <span style={{ fontSize: 11, color: "#828282" }}>
                    v{p.version}
                  </span>
                )}
              </div>
              <span className="software-card-arrow muted" style={{ fontSize: 12 }}>→</span>
            </div>

            <p style={{ margin: 0, padding: "16px 18px 4px", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>
              {p.tagline}
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "max-content 1fr",
                rowGap: 6,
                columnGap: 18,
                padding: "10px 18px 16px",
                fontSize: 12,
              }}
            >
              <span style={{ color: "#555" }}>Capabilities</span>
              <span style={{ color: "#c8c8c8" }}>{p.capabilities.join(" · ")}</span>

              <span style={{ color: "#555" }}>Footprint</span>
              <span style={{ color: "#c8c8c8" }}>{p.footprint}</span>

              {p.downloadSize != null && (
                <>
                  <span style={{ color: "#555" }}>Download</span>
                  <span style={{ color: "#c8c8c8" }}>
                    {formatBytes(p.downloadSize)}
                    {p.downloadLabel ? ` · ${p.downloadLabel}` : ""}
                  </span>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

    </>
  );
}
