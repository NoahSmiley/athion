import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link href="/" style={{ textDecoration: "none", color: "#fff", fontSize: 15, fontWeight: 500, display: "block", marginBottom: 20 }}>Athion</Link>
        {children}
      </div>
    </div>
  );
}
