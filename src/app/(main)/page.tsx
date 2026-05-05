"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

type DownloadInfo = { url: string; size: number; label: string };

function detectPlatformLabel(): string {
  if (typeof navigator === "undefined") return "macOS";
  const platform = navigator.platform;
  if (/Mac/i.test(platform)) return "macOS (Apple Silicon)";
  if (/Win/i.test(platform)) return "Windows";
  if (/Linux/i.test(platform)) return "Linux";
  return "macOS (Apple Silicon)";
}

function formatBytes(bytes: number): string {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export default function HomePage() {
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [download, setDownload] = useState<DownloadInfo | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsAuthed(!!d.user))
      .catch(() => setIsAuthed(false));

    fetch("/api/opendock/releases/latest")
      .then((r) => r.ok ? r.json() : null)
      .then((release: { artifacts?: { target: string; url: string; installer_url?: string; size_bytes: number }[] } | null) => {
        if (!release?.artifacts?.length) return;
        const artifact = release.artifacts.find((a) => a.target === "darwin-aarch64") ?? release.artifacts[0];
        setDownload({
          url: artifact.installer_url ?? artifact.url,
          size: artifact.size_bytes,
          label: detectPlatformLabel(),
        });
      })
      .catch(() => {});
  }, []);

  return (
    <div className="home-page tall-page" style={{ display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%", maxWidth: 720, padding: "40px 24px 56px", boxSizing: "border-box", gap: 56 }}>
      {/* Hero — Opendock */}
      <section>
        <div style={{ fontSize: 11, letterSpacing: 1.4, color: "#555", textTransform: "uppercase" }}>Opendock</div>
        <h1 style={{ margin: "10px 0 0", fontSize: 28, fontWeight: 600, letterSpacing: -0.5, color: "#fff", lineHeight: 1.2 }}>
          Lightweight project tracking. From quick notes to full sprints.
        </h1>
        <p style={{ margin: "16px 0 0", fontSize: 14, color: "#c8c8c8", lineHeight: 1.6, maxWidth: 540 }}>
          A native desktop app that scales with the work. Capture a thought, organize a day, ship a project — without the bloat of Notion or the overhead of Jira.
        </p>

        {/* ASCII kanban demo */}
        <KanbanPreview />

        <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          {download ? (
            <>
              <a href={download.url} className="cta-light" style={{ padding: "10px 18px", borderRadius: 6, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                Download for {download.label}
              </a>
              <span className="muted" style={{ fontSize: 12 }}>Free · {formatBytes(download.size)}</span>
              <Link href="/opendock" className="muted" style={{ fontSize: 12 }}>Learn more →</Link>
            </>
          ) : (
            <>
              <Link href="/opendock/download" className="cta-light" style={{ padding: "10px 18px", borderRadius: 6, fontWeight: 600, fontSize: 13, textDecoration: "none" }}>
                Download Opendock
              </Link>
              <span className="muted" style={{ fontSize: 12 }}>Free</span>
              <Link href="/opendock" className="muted" style={{ fontSize: 12 }}>Learn more →</Link>
            </>
          )}
        </div>
      </section>

      {/* Also by Athion */}
      <section>
        <div style={{ fontSize: 10, letterSpacing: 1.6, color: "#555", textTransform: "uppercase", marginBottom: 16 }}>
          Also by Athion
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <ProductRow
            href="/prime"
            name="Athion Prime"
            kind="Streaming"
            desc="One service for all your streaming. Invite-only."
            preview={<PrimePreview />}
          />
          <ProductRow
            href="/infra"
            name="Homelab"
            kind="Infrastructure"
            desc="Game servers, media, password manager, file sync. Behind the scenes."
            preview={<HomelabPreview />}
          />
        </div>
      </section>

      {/* Reading + footer-ish links */}
      <section style={{ display: "flex", gap: 20, fontSize: 12 }}>
        <Link href="/docs" className="muted">Docs →</Link>
        <Link href="/blog" className="muted">Blog →</Link>
        {isAuthed === false && <Link href="/process" className="muted">How to join →</Link>}
      </section>
    </div>
  );
}

function ProductRow({ href, name, kind, desc, preview }: { href: string; name: string; kind: string; desc: string; preview: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="home-product-row"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 240px",
        gap: 24,
        alignItems: "center",
        padding: "14px 16px",
        border: "1px solid #1f1f1f",
        background: "#0a0a0a",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", letterSpacing: -0.1 }}>{name}</span>
          <span style={{ fontSize: 10, letterSpacing: 1.4, color: "#555", textTransform: "uppercase" }}>{kind}</span>
        </div>
        <p style={{ fontSize: 13, color: "#c8c8c8", lineHeight: 1.55, margin: "6px 0 0" }}>{desc}</p>
      </div>
      <div className="home-row-preview">{preview}</div>
    </Link>
  );
}

/* ───────────────────────── ASCII previews ───────────────────────── */

function KanbanPreview() {
  // Animated kanban: a card cycles through columns to show motion.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1800);
    return () => clearInterval(id);
  }, []);

  // Ship 0.1.0 will be in column index (tick % 3): 0 = TODO, 1 = IN PROGRESS, 2 = DONE
  const phase = tick % 3;
  const todo = ["Fix login bug", "Add settings page", "Onboarding flow"];
  const wip = ["Refactor api layer", "Write release notes"];
  const done = ["Setup CI", "Schema migration", "Branding pass"];
  if (phase === 0) todo.unshift("● Ship 0.1.0");
  else if (phase === 1) wip.unshift("● Ship 0.1.0");
  else done.unshift("● Ship 0.1.0 ✓");

  return (
    <div className="ascii-preview" style={{ marginTop: 24, padding: "14px 16px", border: "1px solid #1f1f1f", background: "#080808", fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.5, color: "#c8c8c8", overflowX: "auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, minWidth: 540 }}>
        <Column title="TODO" cards={todo} highlight={phase === 0 ? 0 : -1} />
        <Column title="IN PROGRESS" cards={wip} highlight={phase === 1 ? 0 : -1} />
        <Column title="DONE" cards={done} highlight={phase === 2 ? 0 : -1} muted />
      </div>
    </div>
  );
}

function Column({ title, cards, highlight, muted }: { title: string; cards: string[]; highlight: number; muted?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: 1.6, color: "#555", marginBottom: 6 }}>{title}</div>
      {cards.map((c, i) => (
        <div
          key={c}
          style={{
            padding: "5px 8px",
            marginBottom: 4,
            background: i === highlight ? "#1a1a1a" : "transparent",
            border: i === highlight ? "1px solid #2a2a2a" : "1px solid #161616",
            color: muted && i !== highlight ? "#666" : (i === highlight ? "#fff" : "#c8c8c8"),
            transition: "all 0.4s ease",
          }}
        >
          {c}
        </div>
      ))}
    </div>
  );
}

function PrimePreview() {
  // Live channel feel — current shows pulsing.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(id);
  }, []);
  const channels = [
    { name: "ESPN HD", show: "The Masters" },
    { name: "HBO", show: "House of D…" },
    { name: "Netflix", show: "Stranger T…" },
    { name: "YouTube", show: "Local News" },
  ];
  return (
    <div className="ascii-preview" style={{ padding: "10px 12px", border: "1px solid #1f1f1f", background: "#080808", fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: 1.5, color: "#c8c8c8", overflow: "hidden" }}>
      <div style={{ fontSize: 8, letterSpacing: 1.4, color: "#555", marginBottom: 4 }}>NOW PLAYING</div>
      {channels.map((c, i) => (
        <div key={c.name} style={{ display: "grid", gridTemplateColumns: "8px 60px 1fr", gap: 6, alignItems: "center" }}>
          <span style={{ color: i === 0 ? "#fff" : "#333", opacity: i === 0 ? (tick % 2 === 0 ? 1 : 0.4) : 1, transition: "opacity 0.3s" }}>●</span>
          <span style={{ color: i === 0 ? "#fff" : "#828282", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</span>
          <span style={{ color: i === 0 ? "#c8c8c8" : "#555", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.show}</span>
        </div>
      ))}
    </div>
  );
}

function HomelabPreview() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1100);
    return () => clearInterval(id);
  }, []);
  const services = [
    { name: "zomboid", status: "online", meta: "2/8" },
    { name: "minecraft", status: "online", meta: "0/100" },
    { name: "jellyfin", status: "online", meta: "" },
    { name: "vault", status: "online", meta: "" },
  ];
  return (
    <div className="ascii-preview" style={{ padding: "10px 12px", border: "1px solid #1f1f1f", background: "#080808", fontFamily: "var(--font-mono)", fontSize: 10, lineHeight: 1.6, color: "#c8c8c8", overflow: "hidden" }}>
      {services.map((s, i) => (
        <div key={s.name} style={{ display: "grid", gridTemplateColumns: "8px 1fr max-content", gap: 6, alignItems: "center" }}>
          <span style={{ color: "#4caf50", opacity: i === (tick % services.length) ? 1 : 0.55, transition: "opacity 0.3s" }}>●</span>
          <span style={{ color: "#c8c8c8" }}>{s.name}</span>
          <span style={{ color: "#555" }}>{s.meta || "online"}</span>
        </div>
      ))}
    </div>
  );
}
