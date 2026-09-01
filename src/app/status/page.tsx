import type { Metadata } from "next";
import { getAllStatuses } from "@/lib/infra/status";
import { LiveRefresh } from "./live-refresh";

export const metadata: Metadata = {
  title: "Status",
  description: "Current availability for public Athion services.",
};

export const dynamic = "force-dynamic";
export const revalidate = 0;

const serviceNames = {
  athionWeb: "athion.me",
  minecraft: "Minecraft",
  prime: "Prime",
  liveTV: "Live TV",
} as const;

export default async function StatusPage() {
  const statuses = await getAllStatuses();
  const allOnline = Object.values(statuses).every((status) => status.online);

  return (
    <main className="status-page">
      <LiveRefresh intervalSeconds={30} />

      <header className="status-nav">
        <a href="/" className="wordmark">Athion <span className="muted">Status</span></a>
        <a href="/" className="nav-link">Back</a>
      </header>

      <div className={`status-summary ${allOnline ? "status-up" : "status-down"}`}>
        {allOnline ? "All public services operational" : "One or more services are unavailable"}
      </div>

      <div className="status-list">
        {(Object.keys(serviceNames) as Array<keyof typeof serviceNames>).map((key) => {
          const status = statuses[key];
          return (
            <section className="status-row" key={key}>
              <div>
                <strong>{serviceNames[key]}</strong>
                {status.players != null && status.maxPlayers != null && (
                  <span className="muted"> · {status.players}/{status.maxPlayers} players</span>
                )}
              </div>
              <div className={status.online ? "status-text-up" : "status-text-down"}>
                {status.online ? "Operational" : "Unavailable"}
                {status.latencyMs != null && <span className="muted"> · {status.latencyMs}ms</span>}
              </div>
            </section>
          );
        })}
      </div>

      <p className="status-note">Live checks refresh every 30 seconds. No synthetic uptime history.</p>
    </main>
  );
}
