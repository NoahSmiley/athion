import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center" }}>
      <Link href="/" style={{ fontWeight: 500, fontSize: 15, textDecoration: "none", marginBottom: 24 }}>Athion</Link>
      <div style={{ width: "100%", maxWidth: 300 }}>{children}</div>
    </div>
  );
}
