import Link from "next/link";

export default function IdeSuccessPage() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <Link href="/" style={{ marginBottom: 24, fontWeight: "bold", fontSize: 15, textDecoration: "none" }}>
        Athion
      </Link>
      <div style={{ textAlign: "center", maxWidth: 380 }}>
        <p style={{ fontSize: 32, marginBottom: 8 }}>&#x2713;</p>
        <h1 style={{ fontSize: 15, margin: "0 0 8px" }}>You&apos;re signed in</h1>
        <p style={{ color: "#828282" }}>
          You can close this tab and return to Liminal IDE.
          The IDE will connect automatically.
        </p>
      </div>
    </div>
  );
}
