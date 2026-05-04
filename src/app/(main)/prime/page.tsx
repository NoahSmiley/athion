import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Athion Prime",
  description: "Invite-only streaming for friends and family.",
};

const features: [string, string][] = [
  ["Movies + TV Shows", "Curated library streamed from athion hardware. Continue where you left off across devices."],
  ["Live TV", "Live channels with an electronic program guide. Sports, news, and the channels worth watching."],
  ["Search", "Find anything across the library and live channels with one query."],
  ["Native Apple TV", "Built for tvOS — proper focus, remote, and AVPlayer for the best picture quality your TV can do."],
  ["Invite-only", "Members are added by hand. No public signup, no recommendations engine, no algorithm."],
  ["Athion SSO", "Single sign-on with the rest of athion. One account, no separate password."],
];

export default function PrimePage() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 36, alignItems: "start" }}>
      <aside style={{ position: "sticky", top: 56, fontSize: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.2 }}>Athion Prime</h1>
        <div style={{ color: "#828282", marginTop: 4 }}>v0.1.0</div>
        <div style={{ color: "#555", marginTop: 4 }}>Apple TV · tvOS 17+</div>

        <div style={{ marginTop: 18, padding: "10px 14px", border: "1px solid #1f1f1f", color: "#828282", fontSize: 11, lineHeight: 1.5 }}>
          Invite-only. App Store distribution coming.
          Want access? Ask in <span style={{ color: "#c8c8c8" }}>#general</span>.
        </div>

        <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid #1f1f1f", color: "#828282", display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 12px" }}>
          <span>Library</span><span style={{ color: "#fff" }}>self-hosted</span>
          <span>Live TV</span><span style={{ color: "#fff" }}>included</span>
          <span>Auth</span><span style={{ color: "#fff" }}>SSO</span>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, margin: 0, color: "#c8c8c8", lineHeight: 1.55 }}>
          Like Netflix, but for friends and family. A curated library of movies, TV shows, and live channels —
          streamed from athion hardware to a native Apple TV app. Members-only.
        </p>

        {features.map(([name, desc]) => (
          <div key={name} style={{ marginTop: 20 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>{name}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>{desc}</p>
          </div>
        ))}

        <h2 style={{ marginTop: 32, fontSize: 14, fontWeight: 600, color: "#fff" }}>Status</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>
          Up and running. Adding people one at a time as the library grows. App Store and TestFlight aren't
          set up yet — current members get a build directly.
        </p>
      </main>
    </div>
  );
}
