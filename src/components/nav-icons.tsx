// Inline SVG icons for sub-nav items. External services use their official
// brand marks (simplified to monochrome so they sit cleanly in the muted nav).
// Athion items use letter monograms in a bordered square so they read as a
// consistent set until each gets a proper logo.

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

export function JellyfinIcon() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M12 .002C8.826.002.998 13.346 1 15.825c0 2.478 4.926 3.696 11 3.696s10.998-1.218 11-3.696c0-2.479-7.827-15.823-11-15.823zm0 7.227c1.696 0 5.874 7.131 5.874 8.453 0 1.324-2.63 1.972-5.874 1.972s-5.875-.648-5.874-1.972C6.126 14.36 10.304 7.23 12 7.23z"/>
    </svg>
  );
}

export function VaultwardenIcon() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
      <path d="M19.5 3h-15A1.5 1.5 0 003 4.5v8.25c0 4.243 2.81 7.95 6.86 9.183l1.726.524a1.5 1.5 0 00.828 0l1.726-.524C18.19 20.7 21 16.993 21 12.75V4.5A1.5 1.5 0 0019.5 3zm-1.125 9.75c0 3.107-2.054 5.825-5.025 6.74L12 19.866v-13.7h6.375v6.584z"/>
    </svg>
  );
}

export function AudiobookshelfIcon() {
  return (
    <svg width={SIZE} height={SIZE} viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h3v16H4zM9 6h3v14H9zM14 4l4 1-2 15-4-1z"/>
    </svg>
  );
}
