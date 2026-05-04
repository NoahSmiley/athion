import Link from "next/link";
import { getArtifactsForRelease, listChannelReleases } from "@/lib/opendock/releases";
import { TARGET_LABELS, type TargetId } from "@/lib/opendock/targets";

export const dynamic = "force-dynamic";

const features: [string, string][] = [
  ["Boards", "Kanban boards with columns, cards, and drag-and-drop. Card detail view with rich content."],
  ["Notes", "Per-card markdown notes with a built-in editor."],
  ["Links", "Saved links attached to cards or boards."],
  ["Sharing", "Multi-member boards. Invite others via the members panel."],
  ["Native shell", "Tauri 2 + Rust. Single signed binary. macOS Apple Silicon today; Windows + Linux planned."],
  ["SSO", "Single sign-on via athion.me — same login as the rest of the site."],
];

const benchmarks: [string, string, string][] = [
  ["Binary size", "16 MB", "380 MB"],
  ["Memory (idle)", "~200 MB", "~450 MB"],
  ["Auto-update", "Signed Tauri updater", "Electron + custom"],
  ["Auth", "Athion SSO", "Email/password"],
];

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default async function OpenDockPage() {
  const [latest] = await listChannelReleases("stable", 1);
  const artifacts = latest ? await getArtifactsForRelease(latest.id) : [];
  const dl = artifacts.find((a) => a.target === "darwin-aarch64") ?? artifacts[0] ?? null;
  const dlOption = dl
    ? {
        label: TARGET_LABELS[dl.target as TargetId],
        url: dl.installerUrl ?? dl.url,
        size: dl.sizeBytes,
      }
    : null;

  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 36, alignItems: "start" }}>
      {/* Sidebar */}
      <aside style={{ position: "sticky", top: 56, fontSize: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.2 }}>Opendock</h1>
        {latest && (
          <div style={{ color: "#828282", marginTop: 4 }}>v{latest.version}</div>
        )}
        {latest && (
          <div style={{ color: "#555", marginTop: 4 }}>
            Released {latest.pubDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </div>
        )}

        {dlOption && (
          <>
            <div style={{ marginTop: 18, color: "#828282" }}>{formatBytes(dlOption.size)} · {dlOption.label}</div>
            <a
              href={dlOption.url}
              className="cta-light"
              style={{
                display: "block",
                marginTop: 8,
                padding: "10px 14px",
                borderRadius: 4,
                fontWeight: 600,
                fontSize: 12,
                textAlign: "center",
                textDecoration: "none",
              }}
            >
              Download
            </a>
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
              <Link href="/opendock/download" className="muted">Other platforms →</Link>
              <Link href="/opendock/releases" className="muted">Release notes →</Link>
              <Link href="/pricing" className="muted">Pricing →</Link>
            </div>
          </>
        )}

        <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid #1f1f1f", color: "#828282", display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 12px" }}>
          <span>Binary</span><span style={{ color: "#fff" }}>16 MB</span>
          <span>RAM</span><span style={{ color: "#fff" }}>~200 MB</span>
          <span>Auth</span><span style={{ color: "#fff" }}>SSO</span>
        </div>
      </aside>

      {/* Content */}
      <main style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, margin: 0, color: "#c8c8c8", lineHeight: 1.55 }}>
          A native desktop client for Athion. Kanban boards, per-card notes, and saved links —
          a Tauri shell over the Athion API. Single sign-on with the rest of the site.
        </p>

        {features.map(([name, desc]) => (
          <div key={name} style={{ marginTop: 20 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>{name}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>{desc}</p>
          </div>
        ))}

        <h2 style={{ marginTop: 32, fontSize: 14, fontWeight: 600, color: "#fff" }}>Compared to Notion</h2>
        <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>
          Notion numbers are approximate, observed on macOS at the time of writing.
        </p>
        <table style={{ marginTop: 8 }}>
          <thead><tr><th>Metric</th><th>Opendock</th><th>Notion</th></tr></thead>
          <tbody>
            {benchmarks.map(([m, o, n]) => (
              <tr key={m}><td>{m}</td><td><b>{o}</b></td><td className="muted">{n}</td></tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}
