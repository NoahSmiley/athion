import Link from "next/link";

const links = [
  ["/about", "About"], ["/blog", "Blog"], ["/careers", "Careers"], ["/security", "Security"],
  ["/privacy", "Privacy"], ["/terms", "Terms"], ["/transparency", "Transparency"],
];
const ext = [["https://github.com/athion", "GitHub"], ["https://status.athion.com", "Status"]];

export function Footer() {
  return (
    <footer style={{ padding: "20px 10px", fontSize: 11, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
      {links.map(([href, label]) => <Link key={href} href={href} className="footer-link">{label}</Link>)}
      {ext.map(([href, label]) => <a key={href} href={href} target="_blank" rel="noopener noreferrer" className="footer-link">{label}</a>)}
    </footer>
  );
}
