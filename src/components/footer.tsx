"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

// Always-visible: Privacy, Terms (legal must be public), Status (external).
// Members-only: About, Blog, Security, Transparency.
const ALWAYS = [["/privacy", "Privacy"], ["/terms", "Terms"]];
const MEMBERS_ONLY = [
  ["/about", "About"],
  ["/blog", "Blog"],
  ["/security", "Security"],
  ["/transparency", "Transparency"],
];
const EXTERNAL = [["https://status.athion.me", "Status"]];

export function Footer({ initialAuthed = false }: { initialAuthed?: boolean } = {}) {
  const [authed, setAuthed] = useState<boolean>(initialAuthed);

  useEffect(() => {
    const bc = new BroadcastChannel("auth");
    bc.onmessage = (e) => {
      if (e.data === "logout") setAuthed(false);
      else if (e.data?.type === "login") setAuthed(true);
    };
    return () => bc.close();
  }, []);

  // /about and /process are also public (visitor-facing). Everything else is members-only.
  const memberLinks = authed ? MEMBERS_ONLY : [["/about", "About"], ["/process", "How to join"]];
  const links = [...memberLinks, ...ALWAYS];

  return (
    <footer style={{ padding: "20px 10px", fontSize: 11, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
      {links.map(([href, label]) => <Link key={href} href={href} className="footer-link">{label}</Link>)}
      {EXTERNAL.map(([href, label]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="footer-link">{label}</a>)}
    </footer>
  );
}
