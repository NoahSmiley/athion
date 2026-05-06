// Inline SVG icons for sub-nav items. Athion items use letter monograms
// in a bordered square so they read as a consistent set until each grows
// its own logo.

const SIZE = 14;

export function AthionMark({ letter }: { letter: string }) {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 14 14" aria-hidden="true">
      <rect x="0.5" y="0.5" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1" />
      <text
        x="7"
        y="10"
        textAnchor="middle"
        fontSize="9"
        fontFamily="OpenAI Sans, sans-serif"
        fontWeight="500"
        fill="currentColor"
      >
        {letter}
      </text>
    </svg>
  );
}
