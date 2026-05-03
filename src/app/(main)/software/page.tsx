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
  status: "active" | "beta" | "planned";
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

const statusColor = (s: ProductData["status"]) =>
  s === "active" ? "#4caf50" : s === "beta" ? "#d4a017" : "#555";

export default async function SoftwarePage() {
  const [latest] = await listChannelReleases("stable", 1);
  const artifacts = latest ? await getArtifactsForRelease(latest.id) : [];
  const dl = artifacts.find((a) => a.target === "darwin-aarch64") ?? artifacts[0] ?? null;

  const products: ProductData[] = [
    {
      slug: "opendock",
      name: "Opendock",
      version: latest?.version,
      tagline: "Native desktop workspace — kanban, notes, calendar, AI. Local-first, no Electron.",
      capabilities: ["Boards", "Notes", "Calendar", "Claude AI"],
      footprint: "30 MB RAM · 18 MB binary · 0.4s startup",
      status: "active",
      downloadUrl: dl ? (dl.installerUrl ?? dl.url) : undefined,
      downloadLabel: dl ? TARGET_LABELS[dl.target as TargetId] : undefined,
      downloadSize: dl?.sizeBytes,
      detailHref: "/opendock",
      pricingHref: "/pricing",
    },
    {
      slug: "shipway",
      name: "Shipway",
      version: "0.3.2",
      tagline: "Self-hosted release pipeline. Tag a commit, get a signed binary on every platform.",
      capabilities: ["Tauri builds", "Code signing", "Updater feeds", "GitHub triggers"],
      footprint: "Single static binary · ~12 MB · runs as systemd unit",
      status: "beta",
      detailHref: "/shipway",
      pricingHref: "/pricing",
    },
    {
      slug: "athlas",
      name: "Athlas",
      version: "0.1.0",
      tagline: "Personal homelab dashboard. Live status, logs, and one-click actions across your CTs/VMs.",
      capabilities: ["Proxmox", "Caddy", "Cloudflared", "Systemd"],
      footprint: "Rust + HTMX · 8 MB binary · 25 MB RAM",
      status: "beta",
      detailHref: "/athlas",
    },
    {
      slug: "porthole",
      name: "Porthole",
      tagline: "Encrypted, local-first port-forward manager. SSH tunnels with the UX of Tailscale.",
      capabilities: ["SSH multiplexing", "Wireguard fallback", "macOS menubar"],
      footprint: "TBD",
      status: "planned",
      detailHref: "/porthole",
    },
  ];

  return (
    <>
      <h1>Software</h1>
      <p className="muted">Products we build and ship. Local-first, lean, and crafted for the long term.</p>

      <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 22 }}>
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
                  <span style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "#828282" }}>
                    v{p.version}
                  </span>
                )}
                <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: statusColor(p.status) }} />
                  <span style={{ color: statusColor(p.status), textTransform: "capitalize" }}>{p.status}</span>
                </span>
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
                fontFamily: "var(--font-mono)",
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

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>More coming.</p>
    </>
  );
}
