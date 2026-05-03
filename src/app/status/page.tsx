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

  const headerBg = allUp ? "#5aa83a" : anyDown ? "#c44" : "#d4a017";

  return (
    <div style={{ minHeight: "100vh", background: "#060606", color: "#c8c8c8", fontFamily: "var(--font-sans)", fontSize: 13, lineHeight: 1.6 }}>
      <LiveRefresh intervalSeconds={30} />

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 40 }}>
          <Link href="https://athion.me" style={{ color: "#fff", textDecoration: "none", fontWeight: 500, fontSize: 13 }}>
            <span>Athion</span>
            <span style={{ fontWeight: 400, color: "#828282", marginLeft: 6 }}>Status</span>
          </Link>
          <Link
            href="https://athion.me"
            style={{
              background: "#0e0e0e",
              border: "1px solid #1f1f1f",
              color: "#c8c8c8",
              padding: "8px 14px",
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: 1.2,
              textTransform: "uppercase",
              textDecoration: "none",
              borderRadius: 4,
            }}
          >
            ← Back to athion.me
          </Link>
        </div>

        <div
          style={{
            background: headerBg,
            color: "#fff",
            padding: "12px 16px",
            borderRadius: 4,
            fontSize: 14,
            fontWeight: 500,
            letterSpacing: -0.05,
          }}
        >
          {headerLabel}
        </div>

        <p style={{ marginTop: 64, marginBottom: 12, textAlign: "right", fontSize: 12, color: "#828282" }}>
          Uptime over the past 90 days. <span style={{ color: "#c8c8c8", fontWeight: 500 }}>Live checks every 30s.</span>
        </p>

        <div style={{ border: "1px solid #1f1f1f", borderRadius: 4, background: "#0a0a0a" }}>
          {services.map((s, i) => {
            const status = statuses[s.key];
            return (
              <div
                key={s.key}
                style={{
                  padding: "26px 28px",
                  borderTop: i === 0 ? "none" : "1px solid #161616",
                }}
              >
                <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: -0.1 }}>{s.name}</span>
                    {status.players != null && status.maxPlayers != null && (
                      <span style={{ color: "#828282", fontSize: 12 }}>
                        · {status.players}/{status.maxPlayers} online
                      </span>
                    )}
                    {status.latencyMs != null && status.online && (
                      <span style={{ color: "#555", fontSize: 11 }}>· {status.latencyMs}ms</span>
                    )}
                  </div>
                  <span style={{ color: status.online ? "#5aa83a" : "#c44", fontSize: 13, fontWeight: 500 }}>
                    {status.online ? "Operational" : "Down"}
                  </span>
                </div>

                <StatusBars service={s.key} online={status.online} />

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto 1fr",
                    alignItems: "center",
                    marginTop: 10,
                    fontSize: 11,
                    color: "#666",
                    gap: 12,
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    90 days ago
                    <span style={{ flex: 1, height: 1, background: "#1f1f1f" }} />
                  </span>
                  <span style={{ color: "#888" }}>history coming soon</span>
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ flex: 1, height: 1, background: "#1f1f1f" }} />
                    Today
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        <p style={{ marginTop: 40, fontSize: 11, color: "#555", textAlign: "center" }}>
          Self-hosted on athion hardware. Historical uptime bars will populate once the sample collector starts running.
        </p>
      </main>
    </div>
  );
}
