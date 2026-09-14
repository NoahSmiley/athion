import { RATIONALE } from "@/lib/rack/content";

export function Rationale() {
  return (
    <section className="rack-section">
      <div className="rack-eyebrow">why this layout</div>
      <h2>What the hardware actually allows</h2>
      <div className="rack-grid2 rack-why">
        {RATIONALE.map((c) => (
          <div key={c.title}>
            <div className="ev">{c.eyebrow}</div>
            <h3>{c.title}</h3>
            <p>{c.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
