// 90-day uptime bars. Phase 1: empty buckets. Phase 2 hydrates from a samples table.
const DAYS = 90;

export function StatusBars({ service: _service }: { service: string }) {
  const bars = Array.from({ length: DAYS }, (_, i) => i);
  return (
    <div style={{ display: "flex", gap: 2, height: 34 }}>
      {bars.map((i) => (
        <div key={i} title="No data yet" style={{ flex: 1, background: "#1f1f1f", borderRadius: 1 }} />
      ))}
    </div>
  );
}
