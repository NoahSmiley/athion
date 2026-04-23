import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="main-sidebar">
        <Navbar />
      </div>
      <div className="main-stage">
        <main>{children}</main>
      </div>
      <div className="main-footer-wrap">
        <Footer />
      </div>
    </>
  );
}
