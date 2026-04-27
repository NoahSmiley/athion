import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software — v3 Spec",
  description: "Software products from Athion.",
};

const mono = { fontFamily: "var(--font-mono)" } as const;
const RULE = "─".repeat(64);

const products = [
  ["opendock", "[active]", "v0.1", "18MB", "/opendock", "kanban, notes, calendar, ai · local-first · sqlite"],
];

const constraints = [
  ["mem.idle", "≤ 50 MB", "ram cost when window is open, no work happening"],
  ["mem.active", "≤ 100 MB", "ram cost mid-task, including ai context"],
  ["binary", "≤ 25 MB", "shipped artifact size, signed"],
  ["coldstart", "≤ 0.5 s", "double-click → first interactive frame"],
  ["cpu.idle", "< 1 %", "sustained cpu while window is in foreground, idle"],
  ["offline", "= 100 %", "every feature works without network. no exceptions."],
];

const stack = [
  ["lang", "rust"],
  ["runtime", "tauri"],
  ["store", "sqlite"],
  ["ui", "react + ts"],
  ["sync", "optional, e2ee"],
  ["dist", "signed binaries, direct download"],
];

const distribution = [
  ["acquire", "subscribe → /pricing → download from product page"],
  ["update", "in-app updater, signed deltas, opt-in"],
  ["data", "local sqlite, plain-text export, open formats"],
  ["telemetry", "off. no opt-in. nothing to send."],
];

export default function SoftwareV3() {
  return (
    <>
      <h1 style={mono}># software</h1>
      <p className="muted" style={mono}>
        products we build and ship. local-first, lean, durable.<br />
        labs is for experiments. this is for things you can rely on.
      </p>

      <pre className="muted" style={{ ...mono, margin: "20px 0 8px", whiteSpace: "pre", overflow: "hidden" }}>{RULE}</pre>
      <h2 style={mono}>## products</h2>
      <table style={mono}>
        <thead>
          <tr>
            <th style={mono}>name</th>
            <th style={mono}>status</th>
            <th style={mono}>ver</th>
            <th style={mono}>size</th>
            <th style={mono}>summary</th>
          </tr>
        </thead>
        <tbody>
          {products.map(([name, status, ver, size, href, summary]) => (
            <tr key={name}>
              <td style={mono}><Link href={href}>{name}</Link></td>
              <td className="muted" style={mono}>{status}</td>
              <td className="muted" style={mono}>{ver}</td>
              <td className="muted" style={mono}>{size}</td>
              <td style={mono}>{summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="muted" style={{ ...mono, marginTop: 8 }}>
        # one product, on purpose. <Link href="/labs">labs</Link> is where new ones graduate from.
      </p>

      <pre className="muted" style={{ ...mono, margin: "20px 0 8px", whiteSpace: "pre", overflow: "hidden" }}>{RULE}</pre>
      <h2 style={mono}>## constraints</h2>
      <p className="muted" style={mono}>every active product holds these on commodity hardware.</p>
      <table style={mono}>
        <tbody>
          {constraints.map(([k, v, note]) => (
            <tr key={k}>
              <td className="muted" style={mono}>{k}</td>
              <td style={mono}>{v}</td>
              <td className="muted" style={mono}>{note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <pre className="muted" style={{ ...mono, margin: "20px 0 8px", whiteSpace: "pre", overflow: "hidden" }}>{RULE}</pre>
      <h2 style={mono}>## stack</h2>
      <table style={mono}>
        <tbody>
          {stack.map(([k, v]) => (
            <tr key={k}>
              <td className="muted" style={mono}>{k}</td>
              <td style={mono}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <pre className="muted" style={{ ...mono, margin: "20px 0 8px", whiteSpace: "pre", overflow: "hidden" }}>{RULE}</pre>
      <h2 style={mono}>## distribution</h2>
      <table style={mono}>
        <tbody>
          {distribution.map(([k, v]) => (
            <tr key={k}>
              <td className="muted" style={mono}>{k}</td>
              <td style={mono}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <pre className="muted" style={{ ...mono, margin: "20px 0 8px", whiteSpace: "pre", overflow: "hidden" }}>{RULE}</pre>
      <p className="muted" style={mono}>
        # related: <Link href="/labs">labs</Link> · <Link href="/security">security</Link> · <Link href="/about">about</Link>
      </p>
    </>
  );
}
