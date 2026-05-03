// Standalone status surface — no main nav/footer. Inline style override re-enables
// scroll since globals.css sets html/body to overflow:hidden for the main app.
export default function StatusLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        html, body { overflow-y: auto !important; height: auto !important; }
      `}</style>
      {children}
    </>
  );
}
