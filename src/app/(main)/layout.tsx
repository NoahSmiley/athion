import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto",
          padding: "20px 10px",
          display: "flex",
          gap: 80,
          flex: 1,
          width: "100%",
        }}
      >
        <div style={{ width: 100, display: "flex", alignItems: "center", marginLeft: -40 }}>
          <Navbar />
        </div>
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <main>{children}</main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
