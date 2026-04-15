import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div style={{ position: "fixed", left: 80, top: 0, bottom: 0, display: "flex", alignItems: "center", zIndex: 1 }}>
        <Navbar />
      </div>
      <div style={{ position: "fixed", inset: 0, display: "flex", justifyContent: "center", alignItems: "center", pointerEvents: "none", overflow: "auto" }}>
        <main style={{ maxWidth: 700, width: "100%", padding: "40px 10px", pointerEvents: "auto", margin: "auto 0" }}>{children}</main>
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0 }}>
        <Footer />
      </div>
    </>
  );
}
