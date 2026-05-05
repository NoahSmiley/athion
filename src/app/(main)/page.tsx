"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";

type VariantKey =
  | "donut"
  | "wave"
  | "wave-dual"
  | "rain"
  | "starfield"
  | "ripple"
  | "tunnel"
  | "pulse";

const variants: { key: VariantKey; name: string }[] = [
  { key: "donut", name: "Spinning donut" },
  { key: "wave", name: "Sine wave" },
  { key: "wave-dual", name: "Dual wave (interference)" },
  { key: "rain", name: "Matrix rain" },
  { key: "starfield", name: "Starfield drift" },
  { key: "ripple", name: "Ripple field" },
  { key: "tunnel", name: "Tunnel" },
  { key: "pulse", name: "Pulse" },
];

const COLS = 84;
const ROWS = 50;

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
  const [variant, setVariant] = useState<VariantKey>("wave");
  const [isAuthed, setIsAuthed] = useState<boolean | null>(null);
  const [download, setDownload] = useState<DownloadInfo | null>(null);

  useEffect(() => {
    setVariant(variants[Math.floor(Math.random() * variants.length)].key);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setIsAuthed(!!d.user))
      .catch(() => setIsAuthed(false));

    // Fetch latest Opendock release for the hero CTA. Falls back to the download
    // page link if the API is unreachable.
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

  const shuffle = () => {
    const others = variants.filter((v) => v.key !== variant);
    const next = others[Math.floor(Math.random() * others.length)].key;
    setVariant(next);
  };

  return (
    <div className="home-page" style={{ display: "flex", flexDirection: "column", alignItems: "stretch", width: "100%", maxWidth: 720, padding: "48px 24px 56px", boxSizing: "border-box", gap: 56 }}>
      {/* Hero — Opendock is the front door. Animation as a small corner mark. */}
      <section style={{ position: "relative" }}>
        <div onClick={shuffle} className="home-corner-mark" style={{ position: "absolute", top: 0, right: 0, width: 96, height: 96, opacity: 0.55, cursor: "pointer", overflow: "hidden", pointerEvents: "auto" }}>
          <Visual variant={variant} />
        </div>

        <div style={{ paddingRight: 120 }}>
          <div style={{ fontSize: 11, letterSpacing: 1.4, color: "#555", textTransform: "uppercase" }}>Opendock</div>
          <h1 style={{ margin: "10px 0 0", fontSize: 30, fontWeight: 600, letterSpacing: -0.5, color: "#fff", lineHeight: 1.15 }}>
            Lightweight project tracking. From quick notes to full sprints.
          </h1>
          <p style={{ margin: "16px 0 0", fontSize: 14, color: "#c8c8c8", lineHeight: 1.6, maxWidth: 540 }}>
            A native desktop app that scales with the work. Capture a thought, organize a day, ship a project — without the bloat of Notion or the overhead of Jira.
          </p>
        </div>

        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
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

      {/* Quiet directory of the rest */}
      <section>
        <div style={{ fontSize: 10, letterSpacing: 1.6, color: "#555", textTransform: "uppercase", marginBottom: 14 }}>
          Also by Athion
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <DirectoryRow
            href="/prime"
            name="Athion Prime"
            kind="Streaming"
            desc="One service for all your streaming. Invite-only."
          />
          <DirectoryRow
            href="/infra"
            name="Homelab"
            kind="Infrastructure"
            desc="Game servers, media, password manager, file sync. Behind the scenes."
          />
          <DirectoryRow
            href="/docs"
            name="Docs"
            kind="Reading"
            desc="How athion software is built — architecture, stacks, conventions."
          />
          <DirectoryRow
            href="/blog"
            name="Blog"
            kind="Reading"
            desc="Notes from the workbench."
          />
        </div>
      </section>

      {isAuthed === false && (
        <div style={{ fontSize: 12 }}>
          <Link href="/process" className="muted">How to join →</Link>
        </div>
      )}
    </div>
  );
}

function DirectoryRow({ href, name, kind, desc }: { href: string; name: string; kind: string; desc: string }) {
  return (
    <Link
      href={href}
      className="home-row"
      style={{
        display: "grid",
        gridTemplateColumns: "max-content 1fr max-content",
        gap: 16,
        alignItems: "baseline",
        padding: "10px 0",
        borderBottom: "1px solid #161616",
        textDecoration: "none",
        color: "inherit",
      }}
    >
      <span style={{ fontSize: 14, fontWeight: 600, color: "#fff", letterSpacing: -0.1 }}>{name}</span>
      <span style={{ fontSize: 12, color: "#828282", lineHeight: 1.5 }}>{desc}</span>
      <span style={{ fontSize: 10, letterSpacing: 1.4, color: "#555", textTransform: "uppercase" }}>{kind}</span>
    </Link>
  );
}

function Visual({ variant }: { variant: VariantKey }) {
  switch (variant) {
    case "donut": return <Donut />;
    case "wave": return <Wave />;
    case "wave-dual": return <WaveDual />;
    case "rain": return <Rain />;
    case "starfield": return <Starfield />;
    case "ripple": return <Ripple />;
    case "tunnel": return <Tunnel />;
    case "pulse": return <Pulse />;
  }
}

// Returns ticks where 1 tick = `ms` of wall-clock time. Decoupled from refresh
// rate so animations are smooth on any display while keeping their original speed.
function useTick(ms = 80) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / ms);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ms]);
  return t;
}

function Frame({ children }: { children: React.ReactNode }) {
  return <pre className="ascii-frame">{children}</pre>;
}

function Donut() {
  const t = useTick(50);
  const A = t * 0.04;
  const B = t * 0.02;
  const cosA = Math.cos(A), sinA = Math.sin(A);
  const cosB = Math.cos(B), sinB = Math.sin(B);

  const output: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));
  const zbuf: number[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const luma = ".,-~:;=!*#$@";

  const R1 = 1;
  const R2 = 2;
  const K2 = 5;
  // Sized to fill the square canvas. ROWS is the limiting dimension because cells are taller than wide.
  const K1 = (ROWS * K2 * 0.25) / (R1 + R2);

  const cx = COLS / 2;
  const cy = ROWS / 2;

  for (let theta = 0; theta < Math.PI * 2; theta += 0.07) {
    const cosT = Math.cos(theta), sinT = Math.sin(theta);
    for (let phi = 0; phi < Math.PI * 2; phi += 0.02) {
      const cosP = Math.cos(phi), sinP = Math.sin(phi);

      // Point on the unrotated torus
      const circleX = R2 + R1 * cosT;
      const circleY = R1 * sinT;

      // 3D coordinates after rotation around the X and Z axes
      const x = circleX * (cosB * cosP + sinA * sinB * sinP) - circleY * cosA * sinB;
      const y = circleX * (sinB * cosP - sinA * cosB * sinP) + circleY * cosA * cosB;
      const z = K2 + cosA * circleX * sinP + circleY * sinA;
      const ooz = 1 / z;

      // Aspect-correct projection (multiply x by 2 because cells are tall)
      const xp = Math.floor(cx + K1 * ooz * x * 2);
      const yp = Math.floor(cy - K1 * ooz * y);

      // Luminance: dot product of surface normal and light direction (0, 1, -1)
      const L = cosP * cosT * sinB - cosA * cosT * sinP - sinA * sinT + cosB * (cosA * sinT - cosT * sinA * sinP);
      if (L > 0 && xp >= 0 && xp < COLS && yp >= 0 && yp < ROWS && ooz > zbuf[yp][xp]) {
        zbuf[yp][xp] = ooz;
        const idx = Math.min(luma.length - 1, Math.max(0, Math.floor(L * 8)));
        output[yp][xp] = luma[idx];
      }
    }
  }
  return <Frame>{output.map((row) => row.join("")).join("\n")}</Frame>;
}

function Wave() {
  const t = useTick(80);
  const lines: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    let line = "";
    for (let c = 0; c < COLS; c++) {
      const phase = (c + t) * 0.25;
      const v = (Math.sin(phase) + Math.sin(phase * 0.6) + 2) / 4;
      const target = (ROWS - 1) / 2 + v * 4 - 2;
      const dist = Math.abs(r - target);
      if (dist < 0.4) line += "█";
      else if (dist < 0.9) line += "▓";
      else if (dist < 1.5) line += "▒";
      else if (dist < 2.2) line += "░";
      else line += " ";
    }
    lines.push(line);
  }
  return <Frame>{lines.join("\n")}</Frame>;
}

function WaveDual() {
  const t = useTick(80);
  const lines: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    let line = "";
    for (let c = 0; c < COLS; c++) {
      const a = Math.sin((c + t) * 0.22);
      const b = Math.sin((c - t * 0.7) * 0.31);
      const v = (a + b + 2) / 4;
      const target = (ROWS - 1) / 2 + (v - 0.5) * 8;
      const dist = Math.abs(r - target);
      if (dist < 0.4) line += "█";
      else if (dist < 1.0) line += "▓";
      else if (dist < 1.8) line += "▒";
      else if (dist < 2.6) line += "░";
      else line += " ";
    }
    lines.push(line);
  }
  return <Frame>{lines.join("\n")}</Frame>;
}

function Rain() {
  const dropsRef = useRef<{ col: number; head: number; len: number; speed: number }[] | null>(null);
  const t = useTick(70);
  if (!dropsRef.current) {
    dropsRef.current = Array.from({ length: 18 }, () => ({
      col: Math.floor(Math.random() * COLS),
      head: Math.floor(Math.random() * ROWS * 2) - ROWS,
      len: 4 + Math.floor(Math.random() * 6),
      speed: 0.3 + Math.random() * 0.5,
    }));
  }
  const drops = dropsRef.current;
  for (const d of drops) {
    d.head = ((t * d.speed) % (ROWS + d.len + 4)) - 2;
  }
  const grid: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));
  const charset = "01<>/\\|=+-*";
  for (const d of drops) {
    for (let i = 0; i < d.len; i++) {
      const r = Math.floor(d.head - i);
      if (r >= 0 && r < ROWS) {
        grid[r][d.col] = charset[Math.floor(d.col * 7 + r * 13 + t) % charset.length];
      }
    }
  }
  return <Frame>{grid.map((row) => row.join("")).join("\n")}</Frame>;
}

function Starfield() {
  const t = useTick(80);
  const starsRef = useRef<{ x: number; y: number; v: number }[] | null>(null);
  if (!starsRef.current) {
    starsRef.current = Array.from({ length: 50 }, () => ({
      x: Math.random() * COLS,
      y: Math.random() * ROWS,
      v: 0.05 + Math.random() * 0.4,
    }));
  }
  const grid: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));
  for (const s of starsRef.current) {
    const x = (s.x + t * s.v) % COLS;
    const r = Math.floor(s.y);
    const c = Math.floor(x);
    if (r >= 0 && r < ROWS && c >= 0 && c < COLS) {
      grid[r][c] = s.v < 0.15 ? "·" : s.v < 0.3 ? "•" : "✦";
    }
  }
  return <Frame>{grid.map((row) => row.join("")).join("\n")}</Frame>;
}

function Ripple() {
  const t = useTick(80);
  const cx = COLS / 2;
  const cy = ROWS / 2;
  const lines: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    let line = "";
    for (let c = 0; c < COLS; c++) {
      const dx = (c - cx) * 0.5;
      const dy = (r - cy) * 1.0;
      const d = Math.sqrt(dx * dx + dy * dy);
      const v = (Math.sin(d - t * 0.3) + 1) / 2;
      if (v > 0.92) line += "█";
      else if (v > 0.78) line += "▓";
      else if (v > 0.55) line += "▒";
      else if (v > 0.3) line += "░";
      else line += " ";
    }
    lines.push(line);
  }
  return <Frame>{lines.join("\n")}</Frame>;
}

function Tunnel() {
  const t = useTick(80);
  const cx = COLS / 2;
  const cy = ROWS / 2;
  const lines: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    let line = "";
    for (let c = 0; c < COLS; c++) {
      const dx = (c - cx) * 0.5;
      const dy = r - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      const v = Math.sin(d * 0.6 - t * 0.25 + angle * 3);
      if (v > 0.7) line += "█";
      else if (v > 0.3) line += "▓";
      else if (v > -0.1) line += "▒";
      else if (v > -0.5) line += "░";
      else line += " ";
    }
    lines.push(line);
  }
  return <Frame>{lines.join("\n")}</Frame>;
}

function Pulse() {
  const t = useTick(60);
  const cx = COLS / 2;
  const cy = ROWS / 2;
  const radius = ((t * 0.3) % 12) + 1;
  const lines: string[] = [];
  for (let r = 0; r < ROWS; r++) {
    let line = "";
    for (let c = 0; c < COLS; c++) {
      const dx = (c - cx) * 0.5;
      const dy = r - cy;
      const d = Math.sqrt(dx * dx + dy * dy);
      const dist = Math.abs(d - radius);
      const fade = 1 - ((t * 0.3) % 12) / 12;
      if (dist < 0.3) line += fade > 0.6 ? "█" : fade > 0.3 ? "▓" : "▒";
      else if (dist < 0.8) line += fade > 0.6 ? "▓" : fade > 0.3 ? "▒" : "░";
      else if (dist < 1.4) line += fade > 0.4 ? "░" : " ";
      else line += " ";
    }
    lines.push(line);
  }
  return <Frame>{lines.join("\n")}</Frame>;
}

