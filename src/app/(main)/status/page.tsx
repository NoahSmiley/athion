import type { Metadata } from "next";
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

const groups = ["Public", "Games", "Internal"] as const;

export default async function StatusPage() {
  const statuses = await getAllStatuses();
  const allUp = services.every((s) => statuses[s.key].online);
  const anyDown = services.some((s) => !statuses[s.key].online);

  const headerLabel = allUp
    ? "All systems operational"
    : anyDown
    ? "Some systems are experiencing issues"
    : "Partial degradation";

  const headerDot = allUp ? "#4caf50" : anyDown ? "#c44" : "#d4a017";

  return (
    <>
      <LiveRefresh intervalSeconds={30} />

      <h1>Status</h1>
      <p className="muted">Live status of athion services and self-hosted infrastructure.</p>

      <div
        style={{
          marginTop: 24,
          border: "1px solid #2a2a2a",
          padding: "16px 22px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontSize: 14, fontWeight: 500 }}>
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: headerDot,
              boxShadow: allUp ? `0 0 8px ${headerDot}66` : "none",
            }}
          />
          {headerLabel}
        </span>
        <span className="muted" style={{ fontSize: 11 }}>
          checked {new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
        </span>
      </div>

      {groups.map((group) => {
        const groupServices = services.filter((s) => s.group === group);
        if (groupServices.length === 0) return null;
        return (
          <section key={group} style={{ marginTop: 28 }}>
            <h2 style={{ margin: "0 0 8px", fontSize: 11, letterSpacing: 1, textTransform: "uppercase", color: "#828282" }}>
              {group}
            </h2>
            <div style={{ border: "1px solid #2a2a2a" }}>
              {groupServices.map((s, i) => {
                const status = statuses[s.key];
                return (
                  <div
                    key={s.key}
                    style={{
                      padding: "14px 20px",
                      borderTop: i === 0 ? "none" : "1px solid #2a2a2a",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 500 }}>{s.name}</span>
                        {status.players != null && status.maxPlayers != null && (
                          <span className="muted" style={{ fontSize: 11 }}>
                            · {status.players}/{status.maxPlayers} online
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
                        {status.latencyMs != null && status.online && (
                          <span className="muted">{status.latencyMs}ms</span>
                        )}
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 6,
                            color: status.online ? "#4caf50" : "#c44",
                          }}
                        >
                          <span
                            style={{
                              width: 7,
                              height: 7,
                              borderRadius: "50%",
                              background: status.online ? "#4caf50" : "#c44",
                              boxShadow: status.online ? "0 0 5px #4caf5066" : "none",
                            }}
                          />
                          {status.online ? "Operational" : "Down"}
                        </span>
                      </div>
                    </div>

                    <div style={{ marginTop: 10 }}>
                      <StatusBars service={s.key} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, fontSize: 10, color: "#555" }}>
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

      <p className="muted" style={{ marginTop: 32, fontSize: 11 }}>
        Self-hosted on athion hardware. Live checks refresh every 30 seconds.
      </p>
    </>
  );
}
