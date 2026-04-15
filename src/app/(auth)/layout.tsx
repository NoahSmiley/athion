import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none" }}>
      <div style={{ width: 260, pointerEvents: "auto" }}>
        <Link href="/" style={{ textDecoration: "none", color: "#fff", fontSize: 15, fontWeight: 500, display: "block", marginBottom: 20 }}>Athion</Link>
        {children}
      </div>
    </div>
  );
}
