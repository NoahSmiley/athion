// 90-day uptime bars. Phase 1: each bar reflects current online state so they
// don't look like dead placeholders. Phase 2 hydrates from a samples table.
const DAYS = 90;

export function StatusBars({ service: _service, online = true }: { service: string; online?: boolean }) {
  const bars = Array.from({ length: DAYS }, (_, i) => i);
  const color = online ? "#3d8b2e" : "#7a2a2a";
  return (
    <div style={{ display: "flex", gap: 2, height: 34 }}>
      {bars.map((i) => (
        <div
          key={i}
          title="No history yet — color reflects current state"
          style={{ flex: 1, background: color, borderRadius: 1, opacity: 0.55 }}
        />
      ))}
    </div>
  );
}
