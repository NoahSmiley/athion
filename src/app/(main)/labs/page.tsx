import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Labs",
  description: "Experiments, prototypes, and open-source work from Athion.",
};

const projects: { name: string; status: string; description: string; href?: string; repo?: string }[] = [
  {
    name: "OpenDock",
    status: "Active",
    description: "Local-first kanban, notes, calendar, and AI in a 30MB native desktop app. Tauri + Rust + SQLite.",
    href: "/opendock",
  },
  {
    name: "ASCII Visuals",
    status: "Live",
    description: "The animated ASCII art on the homepage. Eight variants — 3D donut, sine waves, matrix rain, starfield, ripple, tunnel, pulse — rendered as text.",
    href: "/",
  },
];

const writing: { title: string; date: string; href?: string }[] = [];

export default function LabsPage() {
  return (
    <>
      <h1>Labs</h1>
      <p className="muted">Experiments, prototypes, and open-source work. Things we&apos;re building or have built that don&apos;t fit neatly into the product list.</p>

      <h2>Projects</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Status</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {projects.map((p) => (
            <tr key={p.name}>
              <td>
                {p.href ? <a href={p.href}>{p.name}</a> : <b>{p.name}</b>}
                {p.repo && <> &middot; <a href={p.repo} target="_blank" rel="noopener noreferrer">repo</a></>}
              </td>
              <td className="muted">{p.status}</td>
              <td>{p.description}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {writing.length > 0 && (
        <>
          <h2>Writing</h2>
          <ul>
            {writing.map((w) => (
              <li key={w.title}>
                {w.href ? <a href={w.href}>{w.title}</a> : w.title} <span className="muted">&mdash; {w.date}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Get in touch</h2>
      <p className="muted">Want to collaborate, or have something we should build? <a href="/contact">Reach out</a>.</p>
    </>
  );
}
