"use client";

import { useEffect, useState } from "react";
import type { TargetId } from "@/lib/opendock/targets";
import { formatBytes } from "@/lib/opendock/targets";

interface Option { target: string; label: string; url: string; size: number }
interface Props { options: Option[] }

function detectTarget(): TargetId | null {
  if (typeof navigator === "undefined") return null;
  const ua = navigator.userAgent;
  const platform = navigator.platform;

  if (/Mac/i.test(platform) || /Mac OS X/.test(ua)) {
    // Heuristic: Apple Silicon Macs report "MacIntel" too. We can't tell reliably
    // from UA alone, but Chrome on M-series exposes navigator.userAgentData.
    const uad = (navigator as Navigator & { userAgentData?: { platform?: string; getHighEntropyValues?: (h: string[]) => Promise<{ architecture?: string }> } }).userAgentData;
    if (uad?.platform === "macOS" && /arm/i.test(ua)) return "darwin-aarch64";
    return "darwin-aarch64";
  }
  if (/Win/i.test(platform)) return "windows-x86_64";
  if (/Linux/i.test(platform)) return "linux-x86_64";
  return null;
}

export function DownloadPrimary({ options }: Props) {
  const [detected, setDetected] = useState<string | null>(null);
  useEffect(() => { setDetected(detectTarget()); }, []);

  if (options.length === 0) return <p className="muted">No installers available for the latest release.</p>;

  const primary = options.find((o) => o.target === detected) ?? options[0];

  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
      <a
        href={primary.url}
        className="cta-light"
        style={{
          display: "inline-block",
          padding: "10px 18px",
          borderRadius: 6,
          fontWeight: 600,
          fontSize: 13,
          textDecoration: "none",
          transition: "background 0.15s",
        }}
      >
        Download for {primary.label}
      </a>
      <span className="muted" style={{ fontSize: 12 }}>
        {formatBytes(primary.size)}
      </span>
    </span>
  );
}
