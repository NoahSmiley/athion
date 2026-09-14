import "./rack.css";

// Standalone surface like /status: no main nav, page scrolls. Fonts are loaded from Google Fonts by family name
// because the 3D scene paints labels onto canvas textures and needs a stable font-family string.
export default function RackLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
      />
      <style>{`
        html, body { overflow-y: auto !important; height: auto !important; }
      `}</style>
      {children}
    </>
  );
}
