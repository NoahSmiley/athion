// 90-day uptime bars. Phase 1: all bars render as "no data" gray.
// Phase 2 will hydrate from a service_status_samples table bucketed by day.

const DAYS = 90;

export function StatusBars({ service: _service }: { service: string }) {
  // Placeholder: render 90 empty bars. Phase 2 fills these in per-day from history.
  const bars = Array.from({ length: DAYS }, (_, i) => i);

  return (
    <div style={{ display: "flex", gap: 2, height: 28 }}>
      {bars.map((i) => (
        <div
          key={i}
          title="No data yet"
          style={{
            flex: 1,
            background: "#1f1f1f",
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  );
}
