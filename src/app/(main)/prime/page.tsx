import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Athion Prime",
  description: "Native Apple TV client for Jellyfin and IPTV.",
};

const features: [string, string][] = [
  ["Jellyfin", "Browse your Jellyfin library — movies, TV shows, episode lists with poster thumbnails and resume-from-position."],
  ["IPTV", "M3U playlists and Xtream Codes API. Categories, channel grids, search."],
  ["Live TV + EPG", "Live channel streams with electronic program guide and current-program lookup, cached per stream."],
  ["Player", "AVPlayer with HLS support and MKV remux fallback. Native tvOS focus and remote handling."],
  ["Sidebar nav", "Home · Movies · TV Shows · Live TV · Search · Settings."],
  ["Native tvOS", "UIKit, no Catalyst, no web view. tvOS 17+."],
];

export default function PrimePage() {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 36, alignItems: "start" }}>
      <aside style={{ position: "sticky", top: 56, fontSize: 12 }}>
        <h1 style={{ margin: 0, fontSize: 20, fontWeight: 600, letterSpacing: -0.2 }}>Athion Prime</h1>
        <div style={{ color: "#828282", marginTop: 4 }}>v0.1.0</div>
        <div style={{ color: "#555", marginTop: 4 }}>tvOS 17+</div>

        <div style={{ marginTop: 18, padding: "10px 14px", border: "1px solid #1f1f1f", color: "#828282", fontSize: 11, lineHeight: 1.5 }}>
          App Store distribution coming. For now, build from source — repo at{" "}
          <span style={{ color: "#c8c8c8" }}>github.com/NoahSmiley/tvos</span>.
        </div>

        <div style={{ marginTop: 22, paddingTop: 16, borderTop: "1px solid #1f1f1f", color: "#828282", display: "grid", gridTemplateColumns: "max-content 1fr", gap: "4px 12px" }}>
          <span>UI</span><span style={{ color: "#fff" }}>UIKit</span>
          <span>Player</span><span style={{ color: "#fff" }}>AVPlayer</span>
          <span>LOC</span><span style={{ color: "#fff" }}>~7,100</span>
        </div>
      </aside>

      <main style={{ minWidth: 0 }}>
        <p style={{ fontSize: 14, margin: 0, color: "#c8c8c8", lineHeight: 1.55 }}>
          A native Apple TV client. Sits on top of Jellyfin for personal media and Xtream/M3U for live TV.
          UIKit, AVPlayer, no Catalyst, no web view.
        </p>

        {features.map(([name, desc]) => (
          <div key={name} style={{ marginTop: 20 }}>
            <h2 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff" }}>{name}</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>{desc}</p>
          </div>
        ))}

        <h2 style={{ marginTop: 32, fontSize: 14, fontWeight: 600, color: "#fff" }}>Status</h2>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: "#c8c8c8", lineHeight: 1.55 }}>
          In active development. Works against the Athion homelab Jellyfin instance and any standard Xtream Codes provider.
          App Store distribution and TestFlight builds are not set up yet — clone the repo and run from Xcode for now.
        </p>
      </main>
    </div>
  );
}
