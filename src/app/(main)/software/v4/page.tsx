import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software — v4 Roadmap",
  description: "Software products from Athion.",
};

type Stage = "Shipping" | "Active dev" | "Designed" | "Considered";

const pipeline: Record<Stage, { name: string; href?: string; note: string }[]> = {
  "Shipping": [
    {
      name: "OpenDock",
      href: "/opendock",
      note: "Local-first kanban, notes, calendar, AI. 30MB native. Tauri + Rust + SQLite.",
    },
  ],
  "Active dev": [],
  "Designed": [],
  "Considered": [],
};

const stageMeaning: Record<Stage, string> = {
  "Shipping": "Available now. Updated regularly, supported, paid.",
  "Active dev": "Being built. Working code, not yet public.",
  "Designed": "Scoped, prototyped, waiting on capacity.",
  "Considered": "Ideas with weight. Not committed to.",
};

const stages: Stage[] = ["Shipping", "Active dev", "Designed", "Considered"];

function Bar({ stage, total }: { stage: Stage; total: number }) {
  const filled = pipeline[stage].length;
  const cells = Array.from({ length: total }, (_, i) => (i < filled ? "█" : "·"));
  return (
    <span style={{ fontFamily: "var(--font-mono)", color: filled > 0 ? "#c8c8c8" : "#444" }}>
      {cells.join(" ")}
    </span>
  );
}

export default function SoftwareV4() {
  const totalSlots = 4;

  return (
    <>
      <h1>Software</h1>
      <p className="muted">Where each product is in its lifecycle. Honest about what&apos;s shipping, honest about what&apos;s empty.</p>

      <h2 style={{ marginTop: 24 }}>Pipeline</h2>
      <table style={{ marginTop: 4 }}>
        <tbody>
          {stages.map((s) => (
            <tr key={s}>
              <td style={{ width: 110 }}><b>{s}</b></td>
              <td className="muted" style={{ width: 40, textAlign: "right" }}>
                {pipeline[s].length}
              </td>
              <td><Bar stage={s} total={totalSlots} /></td>
            </tr>
          ))}
        </tbody>
      </table>

      {stages.map((s) => (
        <div key={s} style={{ marginTop: 24 }}>
          <h2>{s}</h2>
          <p className="muted">{stageMeaning[s]}</p>
          {pipeline[s].length > 0 ? (
            <ul style={{ marginTop: 6 }}>
              {pipeline[s].map((p) => (
                <li key={p.name}>
                  {p.href ? <Link href={p.href}><b>{p.name}</b></Link> : <b>{p.name}</b>}
                  {" "}&ndash;{" "}
                  <span className="muted">{p.note}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="muted" style={{ marginTop: 6, fontStyle: "italic" }}>
              {s === "Active dev" && "Nothing here yet. The next entry will be worth waiting for."}
              {s === "Designed" && "Empty. Sketches and prototypes live in Labs until they earn this stage."}
              {s === "Considered" && "Empty in public. We don't list ideas we haven't weighed seriously."}
            </p>
          )}
        </div>
      ))}

      <h2 style={{ marginTop: 32 }}>What graduation costs</h2>
      <p className="muted">A product moves from one column to the next only when it clears the next bar.</p>
      <table style={{ marginTop: 6 }}>
        <thead>
          <tr><th>Move</th><th>Required</th></tr>
        </thead>
        <tbody>
          <tr>
            <td className="muted">Considered → Designed</td>
            <td>A working prototype in <Link href="/labs">Labs</Link>. Real code, not a doc.</td>
          </tr>
          <tr>
            <td className="muted">Designed → Active dev</td>
            <td>A scoped MVP, an owner, and a dated commitment.</td>
          </tr>
          <tr>
            <td className="muted">Active dev → Shipping</td>
            <td>Holds the performance budget on real hardware. Signed binaries. Public.</td>
          </tr>
        </tbody>
      </table>

      <p className="muted" style={{ marginTop: 24 }}>
        Curious about prototypes that haven&apos;t entered the pipeline yet?
        See <Link href="/labs">Labs</Link>.
      </p>
    </>
  );
}
