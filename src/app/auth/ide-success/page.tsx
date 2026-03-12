import Link from "next/link";
import { BrainLogo } from "@/components/brain-logo";

export default function IdeSuccessPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-10 flex items-center gap-2 text-foreground hover:text-accent transition-colors"
      >
        <BrainLogo size={28} />
        <span className="font-[590] text-lg tracking-[-0.022em]">Athion</span>
      </Link>
      <div className="w-full max-w-sm text-center">
        <div className="text-4xl mb-4">&#x2713;</div>
        <h1 className="font-[590] text-3xl tracking-[-0.022em]">
          You&apos;re signed in
        </h1>
        <p className="mt-3 text-sm text-foreground-muted">
          You can close this tab and return to Liminal IDE.
          The IDE will connect automatically.
        </p>
      </div>
    </div>
  );
}
