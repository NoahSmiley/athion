// Inline SVG icons for sub-nav items. Each icon is a unique mark inside
// a uniform 14px bordered square — same outer shape across the set so the
// nav reads as a coherent group, but each item has its own glyph.

const SIZE = 14;

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 14 14" aria-hidden="true">
      <rect x="0.5" y="0.5" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1" />
      {children}
    </svg>
  );
}

// Opendock — stacked kanban columns (project tracking).
export function OpendockIcon() {
  return (
    <Frame>
      <rect x="3" y="3" width="2" height="6" fill="currentColor" />
      <rect x="6.5" y="3" width="2" height="4" fill="currentColor" />
      <rect x="10" y="3" width="2" height="2" fill="currentColor" />
    </Frame>
  );
}

// athctl — terminal prompt chevron.
export function AthctlIcon() {
  return (
    <Frame>
      <path d="M3.5 4.5 L6 7 L3.5 9.5" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="7" y1="10" x2="11" y2="10" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </Frame>
  );
}

// Athion Prime — play triangle (streaming).
export function PrimeIcon() {
  return (
    <Frame>
      <path d="M5 4 L11 7 L5 10 Z" fill="currentColor" />
    </Frame>
  );
}

// Athion Mail — envelope.
export function MailIcon() {
  return (
    <Frame>
      <rect x="3" y="4.5" width="8" height="5" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M3 4.5 L7 7.5 L11 4.5" fill="none" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </Frame>
  );
}

// Project Zomboid — bold Z (game server marker).
export function ZomboidIcon() {
  return (
    <Frame>
      <path d="M4 4 H10 L4 10 H10" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

// athion.me — concentric squares (the site within the network).
export function SiteIcon() {
  return (
    <Frame>
      <rect x="3.5" y="3.5" width="7" height="7" fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x="6" y="6" width="2" height="2" fill="currentColor" />
    </Frame>
  );
}

// Status — heartbeat / pulse line.
export function StatusIcon() {
  return (
    <Frame>
      <path d="M3 7 H5 L6 4.5 L8 9.5 L9 7 H11" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}
