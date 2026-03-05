import Link from "next/link";
import { BrainLogo } from "@/components/brain-logo";

const footerLinks = {
  Products: [
    { href: "/flux", label: "Flux" },
    { href: "/ide", label: "IDE" },
    { href: "/hosting", label: "Hosting" },
    { href: "/consulting", label: "Consulting" },
    { href: "/pricing", label: "Pricing" },
  ],
  Company: [
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
    { href: "/careers", label: "Careers" },
    { href: "/contact", label: "Contact" },
  ],
  Resources: [
    { href: "/security", label: "Security" },
    { href: "https://status.athion.com", label: "Status", external: true },
  ],
  Legal: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link
              href="/"
              className="flex items-center gap-2 text-foreground hover:text-accent transition-colors"
            >
              <BrainLogo size={20} />
              <span className="font-serif text-lg tracking-tight">Athion</span>
            </Link>
            <p className="mt-4 text-xs text-foreground-muted leading-relaxed max-w-[200px]">
              Engineering, refined.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <p className="text-xs uppercase tracking-widest text-foreground-muted mb-4">
                {category}
              </p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    {"external" in link ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-foreground-muted hover:text-foreground transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-16 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-foreground-muted">
            &copy; {new Date().getFullYear()} Athion. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/athion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              GitHub
            </a>
            <a
              href="https://x.com/athion"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-foreground-muted hover:text-foreground transition-colors"
            >
              X
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
