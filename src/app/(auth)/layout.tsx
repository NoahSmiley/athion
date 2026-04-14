import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "48px 24px" }}>
      <Link href="/" style={{ marginBottom: 24, fontWeight: "bold", fontSize: 15, textDecoration: "none" }}>
        Athion
      </Link>
      <div style={{ width: "100%", maxWidth: 380, padding: 24, border: "1px solid #333", background: "#222" }}>
        {children}
      </div>
      <p style={{ marginTop: 16, fontSize: 11, color: "#828282" }}>
        Secure authentication powered by Athion
      </p>
    </div>
  );
}
