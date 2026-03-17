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
        className="mb-12 flex items-center gap-2.5 text-foreground hover:text-accent transition-colors"
      >
        <BrainLogo size={24} />
        <span className="font-[590] text-base tracking-[-0.022em]">Athion</span>
      </Link>
      <div className="w-full max-w-[380px] p-8 bg-white/[0.02] border border-white/[0.06] rounded-xl">
        {children}
      </div>
      <p className="mt-6 text-xs text-foreground-muted/40">
        Secure authentication powered by Athion
      </p>
    </div>
  );
}
