"use client";

import { useEffect, useState } from "react";

// Variant: tiny ASCII micro-animations next to each step. Each visual is a
// monospace grid that re-renders on every tick. Same homepage aesthetic but
// in 16×8 cell windows.

const COLS = 18;
const ROWS = 8;

const steps = [
  { num: "01", title: "Apply", body: "Email, GitHub, vouchers. Three fields. You get an application id you can bookmark." },
  { num: "02", title: "Review", body: "A real person reads your application and looks at your code. No automated filters." },
  { num: "03", title: "Interview", body: "Promising applicants exchange a few text messages with us. Async. No calls." },
  { num: "04", title: "Decision", body: "Approved applicants receive a single-use invite code. It expires in 14 days." },
  { num: "05", title: "Welcome", body: "Use the code at signup. You get a member number. One invite a month, after a 30-day cooldown." },
];

export function AsciiVariant() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {steps.map((s, i) => (
        <div key={s.num} style={{ display: "flex", gap: 24, padding: "20px 0", borderTop: i === 0 ? "none" : "1px solid #1a1a1a", alignItems: "center" }}>
          <div style={{ flex: "0 0 144px" }}>
            <AsciiVisual step={i} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: "#555", fontFamily: "var(--font-mono)", letterSpacing: 1 }}>{s.num}</div>
            <h2 style={{ marginTop: 4, fontSize: 14 }}>{s.title}</h2>
            <p className="muted" style={{ marginTop: 4, lineHeight: 1.55, maxWidth: 420 }}>{s.body}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function useTick(ms = 80) {
  const [t, setT] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      setT((now - start) / ms);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [ms]);
  return t;
}

function Frame({ children }: { children: React.ReactNode }) {
  return (
    <pre
      style={{
        margin: 0,
        fontFamily: "var(--font-mono)",
        fontSize: 11,
        lineHeight: 1.05,
        color: "#c8c8c8",
        whiteSpace: "pre",
        letterSpacing: 0,
      }}
    >
      {children}
    </pre>
  );
}

function AsciiVisual({ step }: { step: number }) {
  if (step === 0) return <ApplyAscii />;
  if (step === 1) return <ReviewAscii />;
  if (step === 2) return <InterviewAscii />;
  if (step === 3) return <DecisionAscii />;
  return <WelcomeAscii />;
}

// 01 — text typing into a form field
function ApplyAscii() {
  const t = useTick(110);
  const grid: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));

  // border
  for (let c = 0; c < COLS; c++) { grid[0][c] = "─"; grid[ROWS - 1][c] = "─"; }
  for (let r = 0; r < ROWS; r++) { grid[r][0] = "│"; grid[r][COLS - 1] = "│"; }
  grid[0][0] = "┌"; grid[0][COLS - 1] = "┐";
  grid[ROWS - 1][0] = "└"; grid[ROWS - 1][COLS - 1] = "┘";

  // typing line
  const total = COLS - 4;
  const typed = Math.floor(t * 0.8) % (total + 18);
  const visible = Math.min(typed, total);
  const charset = "abcdefghijklmnopqrstuvwxyz@.";
  for (let i = 0; i < visible; i++) {
    grid[3][2 + i] = charset[(i * 7) % charset.length];
  }
  // cursor blink at end of typed text (or end of field)
  const cursorX = 2 + Math.min(visible, total - 1);
  if (Math.floor(t / 4) % 2 === 0 && visible < total) {
    grid[3][cursorX] = "▏";
  }

  return <Frame>{grid.map((row) => row.join("")).join("\n")}</Frame>;
}

// 02 — magnifying glass sweeping across "lines of text"
function ReviewAscii() {
  const t = useTick(110);
  const grid: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));

  // text rows
  const lines = [
    "─── ─────── ──",
    "─────── ──── ───",
    "── ──────── ─",
  ];
  for (let li = 0; li < lines.length; li++) {
    const text = lines[li];
    const r = 2 + li * 2;
    for (let c = 0; c < text.length && c + 1 < COLS - 1; c++) {
      grid[r][1 + c] = text[c];
    }
  }

  // magnifying glass position (sweeps left-right with sine)
  const center = Math.floor(COLS / 2 + Math.sin(t * 0.4) * 5);
  const lensRow = 4;
  // lens
  if (center - 1 >= 0 && center - 1 < COLS) grid[lensRow][center - 1] = "(";
  if (center + 1 >= 0 && center + 1 < COLS) grid[lensRow][center + 1] = ")";
  if (center >= 0 && center < COLS) grid[lensRow][center] = "o";
  // handle
  if (center + 2 < COLS) grid[lensRow + 1][center + 2] = "\\";

  return <Frame>{grid.map((row) => row.join("")).join("\n")}</Frame>;
}

// 03 — two chat lines alternating
function InterviewAscii() {
  const t = useTick(110);
  const grid: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));
  const phase = Math.floor(t / 12) % 2;

  // bubble A on the left, B on the right; one shows at a time
  const bubbleA = ["┌──────┐", "│ ──── │", "└──────┘"];
  const bubbleB = ["┌──────┐", "│ ──── │", "└──────┘"];

  if (phase === 0) {
    for (let i = 0; i < bubbleA.length; i++) {
      for (let c = 0; c < bubbleA[i].length; c++) {
        if (1 + c < COLS) grid[1 + i][1 + c] = bubbleA[i][c];
      }
    }
  } else {
    for (let i = 0; i < bubbleB.length; i++) {
      for (let c = 0; c < bubbleB[i].length; c++) {
        const x = COLS - 1 - bubbleB[i].length + c;
        if (x >= 0 && x < COLS) grid[4 + i][x] = bubbleB[i][c];
      }
    }
  }

  return <Frame>{grid.map((row) => row.join("")).join("\n")}</Frame>;
}

// 04 — stamp falling down + check appearing
function DecisionAscii() {
  const t = useTick(110);
  const grid: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));

  // paper outline
  for (let c = 1; c < COLS - 1; c++) { grid[1][c] = "─"; grid[ROWS - 1][c] = "─"; }
  for (let r = 1; r < ROWS; r++) { grid[r][1] = "│"; grid[r][COLS - 2] = "│"; }
  grid[1][1] = "┌"; grid[1][COLS - 2] = "┐";
  grid[ROWS - 1][1] = "└"; grid[ROWS - 1][COLS - 2] = "┘";

  // cycle: stamp falls (rows 0..4), then ✓ appears, repeat
  const phase = (t * 0.4) % 30;
  if (phase < 14) {
    // stamp falling
    const yOffset = Math.min(Math.floor(phase / 3), 4);
    const sx = 7;
    if (yOffset >= 0 && yOffset < ROWS) {
      grid[yOffset][sx] = "[";
      grid[yOffset][sx + 1] = "*";
      grid[yOffset][sx + 2] = "]";
    }
  } else {
    // checkmark stamped
    grid[4][7] = "✓";
  }

  return <Frame>{grid.map((row) => row.join("")).join("\n")}</Frame>;
}

// 05 — door swinging open with light spilling
function WelcomeAscii() {
  const t = useTick(110);
  const grid: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));

  const phase = (t * 0.3) % 20;
  // doorway
  for (let r = 1; r < ROWS - 1; r++) { grid[r][6] = "│"; grid[r][12] = "│"; }
  grid[1][6] = "┌"; grid[1][12] = "┐";

  if (phase < 8) {
    // closed
    for (let r = 2; r < ROWS - 1; r++) {
      for (let c = 7; c < 12; c++) {
        grid[r][c] = "█";
      }
    }
    grid[4][11] = "●";
  } else {
    // opening + light
    const opening = Math.min(Math.floor((phase - 8) * 0.8), 5);
    for (let r = 2; r < ROWS - 1; r++) {
      for (let c = 7; c < 12 - opening; c++) {
        grid[r][c] = "█";
      }
      // light gradient inside the opened part
      for (let c = 12 - opening; c < 12; c++) {
        const dist = 12 - c;
        grid[r][c] = dist <= 1 ? "░" : dist <= 2 ? "▒" : "▓";
      }
    }
  }

  return <Frame>{grid.map((row) => row.join("")).join("\n")}</Frame>;
}
