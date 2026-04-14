import Link from "next/link";

export default function NotFound() {
  return (
    <div style={{ textAlign: "center", padding: "60px 0" }}>
      <p style={{ fontSize: 24, fontWeight: "bold" }}>404</p>
      <p className="muted">Nothing here.</p>
      <Link href="/">Back to Home</Link>
    </div>
  );
}
