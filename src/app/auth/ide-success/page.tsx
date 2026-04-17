import Link from "next/link";

export default function IdeSuccessPage() {
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
      <div style={{ width: 260, pointerEvents: "auto", textAlign: "center" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#fff", fontSize: 15, fontWeight: 500, display: "block", marginBottom: 20 }}>Athion</Link>
        <p style={{ fontSize: 28, margin: "0 0 8px", color: "#c8c8c8" }}>&#x2713;</p>
        <h1 style={{ fontSize: 15, margin: "0 0 8px", color: "#fff", fontWeight: 600 }}>You&apos;re signed in</h1>
        <p style={{ color: "#828282", fontSize: 13, margin: 0, lineHeight: 1.6 }}>
          You can close this tab. The app will connect automatically.
        </p>
      </div>
    </div>
  );
}
