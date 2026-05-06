// Sub-nav logos. Each is a complete typographic unit inside a uniform 92x20
// bordered rectangle — not an icon + label, but a wordmark designed as a
// single visual treatment. Same outer box across the set so the nav reads
// as a coherent series of plates while each mark stays distinctive.

const W = 92;
const H = 20;

function Plate({ children }: { children: React.ReactNode }) {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" style={{ display: "block" }}>
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} fill="none" stroke="currentColor" strokeWidth="1" />
      {children}
    </svg>
  );
}

function Word({ x, weight, letterSpacing, children }: { x: number; weight: number; letterSpacing?: number; children: string }) {
  return (
    <text
      x={x}
      y="14"
      fontSize="11"
      fontFamily="OpenAI Sans, sans-serif"
      fontWeight={weight}
      fill="currentColor"
      letterSpacing={letterSpacing ?? 0}
    >
      {children}
    </text>
  );
}

// Opendock — kanban bars built into the lockup at the left.
export function OpendockLogo() {
  return (
    <Plate>
      <rect x="6" y="6" width="2" height="8" fill="currentColor" />
      <rect x="9" y="6" width="2" height="6" fill="currentColor" />
      <rect x="12" y="6" width="2" height="4" fill="currentColor" />
      <Word x={18} weight={600}>Opendock</Word>
    </Plate>
  );
}

// athctl — terminal prompt as part of the lockup, lowercase mono-feel.
export function AthctlLogo() {
  return (
    <Plate>
      <text x="6" y="14" fontSize="11" fontFamily="Courier New, monospace" fontWeight={700} fill="currentColor">
        &gt;_
      </text>
      <text x="22" y="14" fontSize="11" fontFamily="Courier New, monospace" fontWeight={500} fill="currentColor" letterSpacing={0.5}>
        athctl
      </text>
    </Plate>
  );
}

// Athion Prime — play-triangle integrated into a tracked-out wordmark.
export function PrimeLogo() {
  return (
    <Plate>
      <path d="M5 6 L13 10 L5 14 Z" fill="currentColor" />
      <text x="17" y="14" fontSize="10" fontFamily="OpenAI Sans, sans-serif" fontWeight={600} fill="currentColor" letterSpacing={1.2}>
        PRIME
      </text>
      <line x1="55" y1="10" x2="83" y2="10" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </Plate>
  );
}

// Athion Mail — envelope flap drawn as the M.
export function MailLogo() {
  return (
    <Plate>
      <rect x="5" y="6" width="11" height="8" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M5 6 L10.5 10.5 L16 6" fill="none" stroke="currentColor" strokeWidth="1" />
      <Word x={20} weight={500}>Athion Mail</Word>
    </Plate>
  );
}

// Project Zomboid — bold lightning Z as the integrated mark.
export function ZomboidLogo() {
  return (
    <Plate>
      <path d="M5 6 H12 L5 14 H12" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <Word x={17} weight={500}>Zomboid</Word>
    </Plate>
  );
}

// athion.me — the dot in the wordmark IS the mark, oversized for emphasis.
export function SiteLogo() {
  return (
    <Plate>
      <text x="6" y="14" fontSize="11" fontFamily="OpenAI Sans, sans-serif" fontWeight={500} fill="currentColor">
        athion
      </text>
      <circle cx="38" cy="13" r="1.6" fill="currentColor" />
      <text x="42" y="14" fontSize="11" fontFamily="OpenAI Sans, sans-serif" fontWeight={500} fill="currentColor">
        me
      </text>
    </Plate>
  );
}

// Status — pulse line built directly into the wordmark.
export function StatusLogo() {
  return (
    <Plate>
      <Word x={6} weight={500}>Status</Word>
      <path d="M44 10 L48 10 L51 6 L55 14 L57 10 L86 10" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
    </Plate>
  );
}
