import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div className="main-shell">
        <div className="main-sidebar">
          <Navbar />
        </div>
        <div className="main-content">
          <main>{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
