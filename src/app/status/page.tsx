import type { Metadata } from "next";
import { getAllStatuses } from "@/lib/infra/status";
import { StatusBars } from "./status-bars";
import { LiveRefresh } from "./live-refresh";

export const metadata: Metadata = {
  title: "Status — Athion",
  description: "Live status of athion services and self-hosted infrastructure.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

type ServiceDef = {
  key: keyof Awaited<ReturnType<typeof getAllStatuses>>;
  name: string;
  group: "Public" | "Games" | "Internal";
};

const services: ServiceDef[] = [
  { key: "athionWeb", name: "athion.me", group: "Public" },
  { key: "postgres", name: "Postgres", group: "Public" },
  { key: "zomboid", name: "Project Zomboid", group: "Games" },
  { key: "minecraft", name: "Minecraft", group: "Games" },
  { key: "jellyfin", name: "Jellyfin", group: "Internal" },
  { key: "vaultwarden", name: "Vaultwarden", group: "Internal" },
  { key: "audiobookshelf", name: "Audiobookshelf", group: "Internal" },
];

export default async function StatusPage() {
  const statuses = await getAllStatuses();
  const allUp = services.every((s) => statuses[s.key].online);
  const anyDown = services.some((s) => !statuses[s.key].online);

  const headerColor = allUp ? "#22c55e" : anyDown ? "#ef4444" : "#eab308";
  const headerLabel = allUp
    ? "All systems operational"
    : anyDown
    ? "Some systems are experiencing issues"
    : "Partial degradation";

  const groups = ["Public", "Games", "Internal"] as const;

  return (
    <div style={{ minHeight: "100vh", background: "#0b0b0b", color: "#e5e5e5", fontFamily: "ui-sans-serif, system-ui, sans-serif" }}>
      <LiveRefresh intervalSeconds={30} />

      <header style={{ borderBottom: "1px solid #1f1f1f", padding: "20px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <a href="https://athion.me" style={{ color: "#e5e5e5", textDecoration: "none", fontWeight: 600, letterSpacing: 0.3 }}>
            athion
          </a>
          <span style={{ color: "#999", fontSize: 12 }}>Status</span>
        </div>
      </header>

      <div style={{ maxWidth: 960, margin: "0 auto", padding: "32px 24px 80px" }}>
        <div
          style={{
            background: headerColor,
            color: allUp ? "#062b14" : "#2b0606",
            padding: "20px 24px",
            borderRadius: 6,
            fontWeight: 600,
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{headerLabel}</span>
          <span style={{ fontSize: 12, fontWeight: 500, opacity: 0.85 }}>
            Updated {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
          </span>
        </div>

        {groups.map((group) => {
          const groupServices = services.filter((s) => s.group === group);
          if (groupServices.length === 0) return null;
          return (
            <section key={group} style={{ marginTop: 32 }}>
              <h2 style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: 1, color: "#888", margin: "0 0 12px", fontWeight: 600 }}>
                {group}
              </h2>
              <div style={{ border: "1px solid #1f1f1f", borderRadius: 6, overflow: "hidden" }}>
                {groupServices.map((s, i) => {
                  const status = statuses[s.key];
                  return (
                    <div
                      key={s.key}
                      style={{
                        padding: "16px 20px",
                        borderTop: i === 0 ? "none" : "1px solid #1f1f1f",
                        background: "#101010",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, minWidth: 0, flex: 1 }}>
                          <span style={{ fontWeight: 500, fontSize: 14 }}>{s.name}</span>
                          {status.players != null && status.maxPlayers != null && (
                            <span style={{ color: "#888", fontSize: 11 }}>
                              · {status.players}/{status.maxPlayers} online
                            </span>
                          )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                          {status.latencyMs != null && status.online && (
                            <span style={{ color: "#666" }}>{status.latencyMs}ms</span>
                          )}
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 6,
                              color: status.online ? "#22c55e" : "#ef4444",
                              fontWeight: 500,
                            }}
                          >
                            <span
                              style={{
                                width: 8,
                                height: 8,
                                borderRadius: "50%",
                                background: status.online ? "#22c55e" : "#ef4444",
                                boxShadow: status.online ? "0 0 6px #22c55e88" : "none",
                              }}
                            />
                            {status.online ? "Operational" : "Down"}
                          </span>
                        </div>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <StatusBars service={s.key} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 10, color: "#555" }}>
                        <span>90 days ago</span>
                        <span>history coming soon</span>
                        <span>today</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}

        <p style={{ marginTop: 48, fontSize: 12, color: "#666", textAlign: "center" }}>
          Self-hosted on athion hardware. Live checks refresh every 30s. Historical uptime
          will populate once the sample collector starts running.
        </p>
      </div>
    </div>
  );
}
