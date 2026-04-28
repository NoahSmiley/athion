import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software — v4",
  description: "Software products from Athion.",
};

type Status = "shipping" | "building" | "considering";

const products: { name: string; href?: string; status: Status; tagline: string; meta?: string }[] = [
  {
    name: "OpenDock",
    href: "/opendock",
    status: "shipping",
    tagline: "Kanban, notes, calendar, and AI in one local-first native app.",
    meta: "Tauri · Rust · SQLite",
  },
  {
    name: "Flux",
    status: "building",
    tagline: "Voice chat, rebuilt. Lower latency, higher fidelity, no electron.",
    meta: "Rust · Opus · self-hosted SFU",
  },
  {
    name: "Athion Mail",
    status: "considering",
    tagline: "An email client that respects your attention.",
  },
  {
    name: "Athion ID",
    status: "considering",
    tagline: "SSO and identity infrastructure for athion-stack apps.",
  },
];

const labelOf = (s: Status) =>
  s === "shipping" ? "Shipping" : s === "building" ? "In build" : "Considering";

const colorOf = (s: Status) =>
  s === "shipping" ? "#c8c8c8" : s === "building" ? "#828282" : "#555";

export default function SoftwareV4Page() {
  const groups: Status[] = ["shipping", "building", "considering"];
  return (
    <>
      <h1>Software</h1>
      <p className="muted">
        Products we ship, products in build, and products we&apos;re thinking about. We move
        slow and we publish what we&apos;re working on so you can hold us to it.
      </p>

      {groups.map((group) => {
        const items = products.filter((p) => p.status === group);
        if (items.length === 0) return null;
        return (
          <section key={group} style={{ marginTop: 28 }}>
            <h2 style={{ fontSize: 11, color: "#828282", letterSpacing: 1, textTransform: "uppercase", margin: 0 }}>
              {labelOf(group)}
            </h2>
            <div style={{ marginTop: 8, borderTop: "1px solid #2a2a2a" }}>
              {items.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "12px 0",
                    borderBottom: "1px solid #2a2a2a",
                    gap: 4,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
                    {p.href ? (
                      <Link href={p.href} style={{ fontWeight: 500, fontSize: 14, color: "#fff", textDecoration: "none" }}>{p.name} →</Link>
                    ) : (
                      <span style={{ fontWeight: 500, fontSize: 14, color: colorOf(group) }}>{p.name}</span>
                    )}
                    {p.meta && <span className="muted" style={{ fontSize: 11 }}>{p.meta}</span>}
                  </div>
                  <p style={{ margin: 0, fontSize: 13, color: group === "considering" ? "#828282" : "#c8c8c8" }}>{p.tagline}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}

      <p className="muted" style={{ marginTop: 32, fontSize: 12 }}>
        See <Link href="/labs">Labs</Link> for experiments and one-off prototypes.
      </p>
    </>
  );
}
