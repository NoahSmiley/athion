import Link from "next/link";
import { BrainLogo } from "@/components/brain-logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-10 flex items-center gap-2 text-foreground hover:text-accent transition-colors"
      >
        <BrainLogo size={28} />
        <span className="font-serif text-xl tracking-tight">Athion</span>
      </Link>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
