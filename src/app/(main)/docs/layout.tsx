import { DocsNav } from "./docs-nav";

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="docs-page">
      <DocsNav />
      {children}
    </div>
  );
}
