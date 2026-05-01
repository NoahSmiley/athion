"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TARGET_LABELS, TARGET_ORDER, type TargetId } from "@/lib/opendock/targets";

type ArtifactDraft = {
  url: string;
  installerUrl: string;
  signature: string;
  sha256: string;
  sizeBytes: string;
};

const EMPTY: ArtifactDraft = { url: "", installerUrl: "", signature: "", sha256: "", sizeBytes: "" };

export function NewReleaseForm() {
  const router = useRouter();
  const [version, setVersion] = useState("");
  const [channel, setChannel] = useState<"stable" | "beta">("stable");
  const [notes, setNotes] = useState("");
  const [arts, setArts] = useState<Record<TargetId, ArtifactDraft>>({
    "darwin-aarch64": { ...EMPTY },
    "darwin-x86_64": { ...EMPTY },
    "windows-x86_64": { ...EMPTY },
    "linux-x86_64": { ...EMPTY },
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (target: TargetId, field: keyof ArtifactDraft, value: string) => {
    setArts((prev) => ({ ...prev, [target]: { ...prev[target], [field]: value } }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setError(null);
    const artifacts = TARGET_ORDER
      .map((t) => ({ target: t, draft: arts[t] }))
      .filter(({ draft }) => draft.url.trim() && draft.signature.trim() && draft.sha256.trim() && draft.sizeBytes.trim())
      .map(({ target, draft }) => ({
        target,
        url: draft.url.trim(),
        installerUrl: draft.installerUrl.trim() || null,
        signature: draft.signature.trim(),
        sha256: draft.sha256.trim(),
        sizeBytes: Number(draft.sizeBytes),
      }));

    if (artifacts.length === 0) { setError("Add at least one platform."); setBusy(false); return; }

    const res = await fetch("/api/admin/opendock/releases", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ version, channel, notes, artifacts }),
    });
    setBusy(false);
    if (!res.ok) { const j = await res.json().catch(() => ({})); setError(j.error ?? `HTTP ${res.status}`); return; }
    router.refresh();
    setVersion(""); setNotes("");
    setArts({ "darwin-aarch64": { ...EMPTY }, "darwin-x86_64": { ...EMPTY }, "windows-x86_64": { ...EMPTY }, "linux-x86_64": { ...EMPTY } });
  };

  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
      <div style={{ display: "flex", gap: 8 }}>
        <input placeholder="Version (e.g. 0.2.0)" value={version} onChange={(e) => setVersion(e.target.value)} required style={inputStyle} />
        <select value={channel} onChange={(e) => setChannel(e.target.value as "stable" | "beta")} style={inputStyle}>
          <option value="stable">stable</option><option value="beta">beta</option>
        </select>
      </div>
      <textarea placeholder="Release notes (markdown ok)" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} style={{ ...inputStyle, resize: "vertical" }} />

      {TARGET_ORDER.map((t) => (
        <fieldset key={t} style={{ border: "1px solid #1a1a1a", borderRadius: 4, padding: 8 }}>
          <legend style={{ fontSize: 12 }}>{TARGET_LABELS[t]}</legend>
          <input placeholder="Updater artifact URL (.tar.gz / .zip)" value={arts[t].url} onChange={(e) => update(t, "url", e.target.value)} style={inputStyle} />
          <input placeholder="Installer URL (.dmg / .nsis) — optional, falls back to updater URL" value={arts[t].installerUrl} onChange={(e) => update(t, "installerUrl", e.target.value)} style={{ ...inputStyle, marginTop: 4 }} />
          <textarea placeholder="Tauri signature (.sig contents)" value={arts[t].signature} onChange={(e) => update(t, "signature", e.target.value)} rows={2} style={{ ...inputStyle, marginTop: 4, fontFamily: "monospace", fontSize: 11 }} />
          <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
            <input placeholder="SHA-256 (hex)" value={arts[t].sha256} onChange={(e) => update(t, "sha256", e.target.value)} style={{ ...inputStyle, fontFamily: "monospace", fontSize: 11 }} />
            <input placeholder="Size (bytes)" inputMode="numeric" value={arts[t].sizeBytes} onChange={(e) => update(t, "sizeBytes", e.target.value)} style={{ ...inputStyle, width: 140 }} />
          </div>
        </fieldset>
      ))}

      {error && <p style={{ color: "#ff453a", fontSize: 12 }}>{error}</p>}
      <button type="submit" disabled={busy} style={{ alignSelf: "flex-start", padding: "6px 14px", fontSize: 13 }}>{busy ? "Publishing…" : "Publish release"}</button>
    </form>
  );
}

const inputStyle: React.CSSProperties = { padding: "4px 8px", background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 3, color: "inherit", fontSize: 12, width: "100%" };
