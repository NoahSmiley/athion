import Link from "next/link";
import { LiveStatus } from "../infra/live-status";
import { ConnectButton } from "../infra/connect-button";

export type ServerSpec = {
  name: string;
  game: string;
  version: string;
  blurb: string;
  address: string;
  liveProbe: "zomboid" | "minecraft";
  rules?: string[];
  facts: { label: string; value: string }[];
  notes?: string;
};

export function ServerPage({ spec }: { spec: ServerSpec }) {
  return (
    <div className="home-page">
      <h1>{spec.name}</h1>
      <p className="muted" style={{ marginTop: -2 }}>{spec.game} · {spec.version}</p>

      <div
        style={{
          marginTop: 16,
          padding: "14px 18px",
          border: "1px solid #1f1f1f",
          background: "#0a0a0a",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <LiveStatus service={spec.liveProbe} />
        <ConnectButton address={spec.address} />
      </div>

      <p style={{ marginTop: 20 }}>{spec.blurb}</p>

      <h2>Connection</h2>
      <table className="home-directory">
        <tbody>
          <tr>
            <td>Address</td>
            <td><code>{spec.address}</code></td>
          </tr>
          {spec.facts.map((f) => (
            <tr key={f.label}>
              <td>{f.label}</td>
              <td className="muted">{f.value}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {spec.rules && spec.rules.length > 0 && (
        <>
          <h2>Rules</h2>
          <ul>
            {spec.rules.map((r) => <li key={r}>{r}</li>)}
          </ul>
        </>
      )}

      {spec.notes && (
        <>
          <h2>Notes</h2>
          <p className="muted">{spec.notes}</p>
        </>
      )}

      <p className="muted" style={{ marginTop: 24 }}>
        Hosted on the <Link href="/infra">Athion homelab</Link>. Uptime tracked at <a href="https://status.athion.me">status.athion.me</a>.
      </p>
    </div>
  );
}
