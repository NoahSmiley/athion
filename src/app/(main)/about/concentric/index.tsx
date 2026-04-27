"use client";

import { useEffect, useState } from "react";

// Variant B — Concentric rings. A small inner core, with rings forming and
// dissolving slowly outward. Suggests "small inner circle, drawing things in."

const COLS = 50;
const ROWS = 14;

export function ConcentricAbout() {
  const [grid, setGrid] = useState<string>(() => " ".repeat(COLS * ROWS));

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = (now - start) / 80;
      const cx = COLS / 2;
      const cy = ROWS / 2;
      const g: string[][] = Array.from({ length: ROWS }, () => Array(COLS).fill(" "));

      // 4 rings, each at a different phase. Each ring moves outward from r=2 to r=18.
      const ringCount = 4;
      for (let i = 0; i < ringCount; i++) {
        const phase = (t * 0.012 + i / ringCount) % 1;
        const r = 2 + phase * 16;
        const fade = 1 - phase; // brighter when newer
        const ch = fade > 0.75 ? "●" : fade > 0.5 ? "○" : fade > 0.25 ? "·" : " ";
        if (ch === " ") continue;

        // rasterize ring, account for cell aspect (cells are taller than wide)
        for (let theta = 0; theta < Math.PI * 2; theta += 0.06) {
          const x = Math.round(cx + Math.cos(theta) * r);
          const y = Math.round(cy + (Math.sin(theta) * r) / 2.1);
          if (x >= 0 && x < COLS && y >= 0 && y < ROWS) {
            g[y][x] = ch;
          }
        }
      }

      // core
      const coreX = Math.round(cx);
      const coreY = Math.round(cy);
      if (coreX >= 0 && coreX < COLS && coreY >= 0 && coreY < ROWS) {
        g[coreY][coreX] = "◆";
      }

      setGrid(g.map((row) => row.join("")).join("\n"));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <pre style={{ margin: 0, fontFamily: "var(--font-mono)", fontSize: "clamp(9px, 1.3vw, 14px)", lineHeight: 1.05, color: "#c8c8c8", whiteSpace: "pre", letterSpacing: 0, textAlign: "center" }}>
      {grid}
    </pre>
  );
}
