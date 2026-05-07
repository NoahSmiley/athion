import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Athion Prime",
  description: "Invite-only streaming for friends and family — Apple TV and web.",
};

const clients: { name: string; tagline: string; status: string; cta?: { label: string; href: string; external?: boolean } }[] = [
  {
    name: "Apple TV",
    tagline: "Native tvOS 17+ app. Built around the focus engine and Siri Remote, AVPlayer for picture quality.",
    status: "Direct-build distribution to current members. App Store / TestFlight not wired up yet.",
  },
  {
    name: "Web",
    tagline: "React + hls.js running in any modern browser. Same library, same SSO, same Live TV.",
    status: "Live at prime.athion.me. Sign in with your athion account.",
    cta: { label: "Open prime.athion.me →", href: "https://prime.athion.me", external: true },
  },
];

const features: [string, string][] = [
  ["Movies + TV Shows", "Curated library streamed from athion hardware. Continue where you left off across devices."],
  ["Live TV", "Live channels with an electronic program guide. Sports, news, and the channels worth watching."],
  ["Search", "Find anything across the library and live channels with one query."],
  ["Two clients, one library", "tvOS app for the living room, web app for everywhere else. Resume position syncs across both."],
  ["Invite-only", "Members are added by hand. No public signup, no recommendations engine, no algorithm."],
  ["Athion SSO", "Single sign-on with the rest of athion. One account, no separate password."],
];

export default function PrimePage() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 36, alignItems: "start" }}>
      <aside style={{ position: "sticky", top: 56, fontSize: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.2 }}>Athion Prime</h1>
        <div style={{ color: "#828282", marginTop: 4 }}>tvOS · web</div>
        <div style={{ color: "#555", marginTop: 4 }}>Apple TV 17+ · any modern browser</div>

        <div style={{ marginTop: 18, padding: "10px 14px", border: "1px solid #1f1f1f", color: "#828282", fontSize: 11, lineHeight: 1.5 }}>
          Invite-only. Want access? Ask in <span style={{ color: "#c8c8c8" }}>#general</span>.
        </div>

        <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid #1f1f1f", color: "#828282", display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 12px" }}>
          <span>Library</span><span style={{ color: "#fff" }}>self-hosted</span>
          <span>Live TV</span><span style={{ color: "#fff" }}>included</span>
          <span>Auth</span><span style={{ color: "#fff" }}>SSO</span>
          <span>Web</span>
          <span>
            <a href="https://prime.athion.me" style={{ color: "#fff" }}>prime.athion.me</a>
          </span>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, margin: 0, color: "#c8c8c8", lineHeight: 1.55 }}>
          Like Netflix, but for friends and family. A curated library of movies, TV shows, and live channels —
          streamed from athion hardware to two clients: a native Apple TV app for the living room and a web app for
          everywhere else. Members-only.
        </p>

        <h2 style={{ marginTop: 28, fontSize: 14, fontWeight: 600, color: "#fff" }}>Clients</h2>
        {clients.map((c) => (
          <div key={c.name} style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #1f1f1f" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 12, flexWrap: "wrap" }}>
              <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff" }}>{c.name}</h3>
              {c.cta ? (
                c.cta.external ? (
                  <a href={c.cta.href} style={{ fontSize: 12 }}>
                    {c.cta.label}
                  </a>
                ) : (
                  <Link href={c.cta.href} style={{ fontSize: 12 }}>
                    {c.cta.label}
                  </Link>
                )
              ) : null}
            </div>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>{c.tagline}</p>
            <p style={{ margin: "4px 0 0", fontSize: 12, color: "#828282", lineHeight: 1.5 }}>{c.status}</p>
          </div>
        ))}

        <h2 style={{ marginTop: 32, fontSize: 14, fontWeight: 600, color: "#fff" }}>Features</h2>
        {features.map(([name, desc]) => (
          <div key={name} style={{ marginTop: 14 }}>
            <h3 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff" }}>{name}</h3>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>{desc}</p>
          </div>
        ))}

        <h2 style={{ marginTop: 32, fontSize: 14, fontWeight: 600, color: "#fff" }}>Status</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>
          Both clients are live. Adding people one at a time as the library grows. tvOS app installs are direct
          builds for now; the web app is open at <a href="https://prime.athion.me">prime.athion.me</a> for any
          athion member.
        </p>
      </main>
    </div>
  );
}
