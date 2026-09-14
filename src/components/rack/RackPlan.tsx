"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useState } from "react";
import { CSS_COLORS, LEGEND, SCHEDULE, speedLabel, speedLong, type Cable } from "@/lib/rack/cables";
import { LEAD } from "@/lib/rack/content";
import type { Mode } from "@/lib/rack/geometry";
import type { ViewPreset } from "./scene/RackScene";
import { Schedule } from "./Schedule";
import { PortMap } from "./PortMap";
import { Rationale } from "./Rationale";
import { Bom } from "./Bom";
import { Steps } from "./Steps";

// three.js touches window/document, so the scene only renders on the client.
const RackScene = dynamic(() => import("./scene/RackScene").then((m) => m.RackScene), { ssr: false });

export function RackPlan() {
  const [mode, setMode] = useState<Mode>("after");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [sidePanels, setSidePanels] = useState(true);
  const [view, setView] = useState<{ preset: ViewPreset; n: number }>({ preset: "front", n: 0 });
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "fallback">("loading");

  const list = SCHEDULE[mode];
  const selected = useMemo(() => list.find((c) => c.id === selectedId) ?? null, [list, selectedId]);

  const onHover = useCallback((c: Cable | null, x: number, y: number) => {
    setHoveredId(c ? c.id : null);
    setTip(c ? { x, y, text: `${c.id}  ${speedLabel(c.speed)}  ${c.a.split(" · ")[0]} → ${c.b.split(" · ")[0]}` } : null);
  }, []);
  const onSelect = useCallback((c: Cable | null) => setSelectedId(c ? c.id : null), []);
  const switchMode = (m: Mode) => {
    setMode(m);
    setSelectedId(null);
    setHoveredId(null);
  };

  return (
    <div className="rack-wrap">
      <header className="rack-header">
        <div>
          <div className="rack-eyebrow">athion homelab · rack elevation and cable schedule · 2026-09-14</div>
          <h1>Athion Rack Plan</h1>
          <p>{LEAD}</p>
        </div>
        <div className="rack-toggle" role="group" aria-label="Layout">
          <button className={mode === "before" ? "on" : ""} onClick={() => switchMode("before")}>
            Today · TP-Link
          </button>
          <button className={mode === "after" ? "on" : ""} onClick={() => switchMode("after")}>
            Plan · UniFi
          </button>
        </div>
      </header>

      <div className="rack-stage">
        <div className="rack-view-wrap">
          <RackScene
            mode={mode}
            selectedId={selectedId}
            hoveredId={hoveredId}
            sidePanels={sidePanels}
            view={view}
            onHover={onHover}
            onSelect={onSelect}
            onLoadState={setLoadState}
          />
          <div className="rack-legend">
            {LEGEND.map((l) => (
              <div key={l.key}>
                <i style={{ background: l.key === "AC" ? "#444a54" : CSS_COLORS[l.key] }} />
                {l.label}
              </div>
            ))}
          </div>
          {tip && (
            <div className="rack-tip" style={{ left: tip.x, top: tip.y }}>
              {tip.text}
            </div>
          )}
          <div className="rack-hint">
            <span>{loadState === "loading" ? "loading ubiquiti 3d models…" : loadState === "loaded" ? "ubiquiti models loaded ·" : "models unavailable, drawn to spec ·"}</span> drag to orbit · wheel to
            zoom · hover or click a cable ·{" "}
            <button onClick={() => setView({ preset: "front", n: view.n + 1 })}>front view</button>{" "}
            <button onClick={() => setView({ preset: "rear", n: view.n + 1 })}>rear view</button>{" "}
            <button onClick={() => setSidePanels((v) => !v)}>{sidePanels ? "hide side panels" : "show side panels"}</button>
          </div>
        </div>
        <aside className="rack-sched">
          <div className="rack-sched-h">
            <h2>{mode === "after" ? "Cable schedule" : "Current cabling"}</h2>
            <span>{list.length} runs</span>
          </div>
          <Schedule list={list} selectedId={selectedId} onSelect={setSelectedId} onHover={setHoveredId} />
          <div className="rack-detail">
            {selected ? (
              <>
                <div className="k">
                  {selected.id} · <span style={{ color: CSS_COLORS[selected.speed] }}>{speedLong(selected.speed)}</span> · {selected.len}
                </div>
                <b>{selected.a}</b> to <b>{selected.b}</b>
                <br />
                {selected.why}
              </>
            ) : (
              <>
                <div className="k">Select a cable</div>Hover the 3D view or click a row to see the reasoning for that run.
              </>
            )}
          </div>
        </aside>
      </div>

      <Rationale />
      <PortMap />
      <Bom />
      <Steps />
    </div>
  );
}
