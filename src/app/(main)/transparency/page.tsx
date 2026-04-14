import Link from "next/link";

const costs = [
  ["Voice infrastructure (LiveKit + Krisp)", "$50/mo"],
  ["Server hardware (self-hosted)", "$25/mo"],
  ["Power & cooling", "$20/mo"],
  ["Network (dedicated line)", "$15/mo"],
  ["DNS & SSL (Cloudflare + Let's Encrypt)", "$2/mo"],
];

const comparisons = [
  ["Discord Nitro", "$10/mo"], ["VS Code + Copilot", "$10/mo"], ["Game server (Apex/Shockbyte)", "$8\u201315/mo"],
  ["VPS (DigitalOcean/Hetzner)", "$12\u201324/mo"], ["Web hosting (Vercel Pro)", "$20/mo"],
];

export default function TransparencyPage() {
  return (
    <>
      <h1>Transparency</h1>
      <p className="muted">Most companies hide their margins. Here&apos;s exactly what it costs to run Athion.</p>
      <h2>Monthly Operating Costs (~$112/mo total)</h2>
      <table>
        <thead><tr><th>Item</th><th>Cost</th></tr></thead>
        <tbody>
          {costs.map(([item, cost]) => <tr key={item}><td>{item}</td><td>{cost}</td></tr>)}
          <tr><td><b>Product development</b></td><td className="muted">remainder</td></tr>
        </tbody>
      </table>
      <h2>What This Would Cost You Separately</h2>
      <table>
        <tbody>{comparisons.map(([n, p]) => <tr key={n}><td className="muted">{n}</td><td className="muted">{p}</td></tr>)}</tbody>
      </table>
      <p style={{ marginTop: 12 }}>Separately: <span className="muted" style={{ textDecoration: "line-through" }}>$60&ndash;79/mo</span>. With Athion Pro: <b>$20/mo</b>.</p>
      <p style={{ marginTop: 12 }}><Link href="/pricing">Back to Pricing</Link></p>
    </>
  );
}
