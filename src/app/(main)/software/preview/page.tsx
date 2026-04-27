import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Software — variant previews",
  description: "Compare layout variants for the /software page.",
};

const variants = [
  {
    href: "/software/v1",
    name: "v1 — Document",
    pitch: "Densest. Principles, products, status legend, performance budget, stack, FAQ. Treats the page as a reference doc.",
  },
  {
    href: "/software/v2",
    name: "v2 — Catalog",
    pitch: "Product-led. Each product gets its own h2 section with full detail (description, version, platforms, benchmarks). Empty stages stated honestly.",
  },
  {
    href: "/software/v3",
    name: "v3 — Spec",
    pitch: "Terminal/README aesthetic. Mono everywhere, ASCII rules between sections, lowercase headers. Reads like a man page.",
  },
  {
    href: "/software/v4",
    name: "v4 — Roadmap",
    pitch: "Lifecycle pipeline: Shipping → Active dev → Designed → Considered. ASCII bar shows each stage's fill. Graduation criteria stated explicitly.",
  },
];

export default function SoftwarePreview() {
  return (
    <>
      <h1>Software — variants</h1>
      <p className="muted">Four candidate layouts for /software. Pick one and we&apos;ll replace the live page with it.</p>

      <h2>Variants</h2>
      <ul>
        {variants.map((v) => (
          <li key={v.href} style={{ marginBottom: 8 }}>
            <Link href={v.href}><b>{v.name}</b></Link>
            <p className="muted" style={{ marginTop: 2 }}>{v.pitch}</p>
          </li>
        ))}
      </ul>

      <h2>Reference</h2>
      <ul>
        <li><Link href="/software">Current /software</Link> &ndash; what&apos;s live now</li>
      </ul>
    </>
  );
}
