import type { Metadata } from "next";
import Link from "next/link";
import { getAllStatuses } from "@/lib/infra/status";
import { StatusBars } from "./status-bars";
import { LiveRefresh } from "./live-refresh";

export const metadata: Metadata = {
  title: "Status",
  description: "Live status of athion services and self-hosted infrastructure.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ServiceDef = {
  key: keyof Awaited<ReturnType<typeof getAllStatuses>>;
  name: string;
};

const services: ServiceDef[] = [
  { key: "athionWeb", name: "athion.me" },
  { key: "postgres", name: "Postgres" },
  { key: "zomboid", name: "Project Zomboid" },
  { key: "minecraft", name: "Minecraft" },
  { key: "jellyfin", name: "Jellyfin" },
  { key: "vaultwarden", name: "Vaultwarden" },
  { key: "audiobookshelf", name: "Audiobookshelf" },
];

export default async function StatusPage() {
  const statuses = await getAllStatuses();
  const allUp = services.every((s) => statuses[s.key].online);
  const anyDown = services.some((s) => !statuses[s.key].online);

  const headerLabel = allUp
    ? "All Systems Operational"
    : anyDown
    ? "Some Systems Are Experiencing Issues"
    : "Partial Degradation";

  // athion palette: dark base #060606, slightly lifted card #0e0e0e, hairline #1f1f1f, dim text #828282
  const headerBg = allUp ? "#3d8b2e" : anyDown ? "#a23a3a" : "#a37b1c";

  return (
    <div style={{ minHeight: "100vh", background: "#060606", color: "#c8c8c8", fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6 }}>
      <LiveRefresh intervalSeconds={30} />

      <header style={{ borderBottom: "1px solid #1a1a1a", padding: "32px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <Link href="https://athion.me" style={{ color: "#fff", textDecoration: "none", fontSize: 24, fontWeight: 600, letterSpacing: 0.3 }}>
            Athion Status
          </Link>
          <Link
            href="https://athion.me"
            style={{
              background: "#fff",
              color: "#060606",
              padding: "10px 18px",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: 4,
            }}
          >
            ← Back to athion.me
          </Link>
        </div>
      </header>

      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 48px 80px" }}>
        <div
          style={{
            background: headerBg,
            color: "#fff",
            padding: "28px 32px",
            borderRadius: 4,
            fontSize: 22,
            fontWeight: 600,
          }}
        >
          {headerLabel}
        </div>

        <div style={{ marginTop: 64, marginBottom: 12, textAlign: "right", fontSize: 12, color: "#828282" }}>
          Uptime over the past 90 days. <span style={{ color: "#c8c8c8" }}>Live checks every 30s.</span>
        </div>

        <div style={{ border: "1px solid #1f1f1f", borderRadius: 4, overflow: "hidden", background: "#0e0e0e" }}>
          {services.map((s, i) => {
            const status = statuses[s.key];
            return (
              <div
                key={s.key}
                style={{
                  padding: "24px 28px",
                  borderTop: i === 0 ? "none" : "1px solid #1f1f1f",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>{s.name}</span>
                    {status.players != null && status.maxPlayers != null && (
                      <span style={{ color: "#828282", fontSize: 12 }}>
                        {status.players}/{status.maxPlayers} online
                      </span>
                    )}
                    {status.latencyMs != null && status.online && (
                      <span style={{ color: "#555", fontSize: 11 }}>· {status.latencyMs}ms</span>
                    )}
                  </div>
                  <span style={{ color: status.online ? "#4caf50" : "#c44", fontSize: 14, fontWeight: 600 }}>
                    {status.online ? "Operational" : "Down"}
                  </span>
                </div>

                <StatusBars service={s.key} />

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, fontSize: 11, color: "#666" }}>
                  <span>90 days ago</span>
                  <span>history coming soon</span>
                  <span>Today</span>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: 48, fontSize: 11, color: "#666", textAlign: "center" }}>
          Self-hosted on athion hardware. Historical uptime bars will populate once the sample collector starts running.
        </p>
      </main>
    </div>
  );
}
