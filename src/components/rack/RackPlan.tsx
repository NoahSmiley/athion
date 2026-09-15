"use client";

import dynamic from "next/dynamic";
import { useCallback, useMemo, useRef, useState } from "react";
import { CSS_COLORS, LEGEND, SCHEDULE, cableCount, isPeripheral, speedLabel, speedLong, type Cable } from "@/lib/rack/cables";
import { LEAD, OWNED_NETWORK } from "@/lib/rack/content";
import type { Mode } from "@/lib/rack/geometry";
import type { ViewPreset } from "./scene/RackScene";
import { Schedule } from "./Schedule";
import { PortMap } from "./PortMap";
import { Rationale } from "./Rationale";
import { Bom } from "./Bom";
import { SpeedFlow } from "./SpeedFlow";
import { speedPath, type FlowTarget } from "@/lib/rack/speeds";
import { Steps } from "./Steps";

// three.js touches window/document, so the scene only renders on the client.
const RackScene = dynamic(() => import("./scene/RackScene").then((m) => m.RackScene), { ssr: false });

export function RackPlan() {
  const [mode, setMode] = useState<Mode>("after");
  const [flowSource, setFlowSource] = useState("GPC");
  const [flowTarget, setFlowTarget] = useState<FlowTarget>("internet");
  const [traceFlow, setTraceFlow] = useState(false);
  const pathIds = useMemo(() => traceFlow ? speedPath(mode, flowSource, flowTarget).ids : [], [mode, flowSource, flowTarget, traceFlow]);
  const [filter, setFilter] = useState<"all" | "peripherals" | "power">("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; text: string } | null>(null);
  const [sidePanels, setSidePanels] = useState(true);
  const [doors, setDoors] = useState(false);
  const [showCables, setShowCables] = useState(true);
  const [labels, setLabels] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<{ preset: ViewPreset; n: number }>({ preset: "equipment", n: 0 });
  const [loadState, setLoadState] = useState<"loading" | "loaded" | "fallback" | "unavailable">("loading");

  const list = SCHEDULE[mode];
  const visibleList = list.filter((c) => filter === "all" || (filter === "peripherals" ? isPeripheral(c) : c.speed === "AC"));
  const selected = useMemo(() => list.find((c) => c.id === selectedId) ?? null, [list, selectedId]);

  const onHover = useCallback((c: Cable | null, x: number, y: number) => {
    setHoveredId(c ? c.id : null);
    setTip(c ? { x, y, text: `${c.id}  ${speedLabel(c.speed)}  ${c.a.split(" · ")[0]} → ${c.b.split(" · ")[0]}` } : null);
  }, []);
  const onSelect = useCallback((c: Cable | null) => { setTraceFlow(false); setSelectedId(c ? c.id : null); }, []);
  const switchMode = (m: Mode) => {
    setMode(m);
    setFlowSource("GPC");
    setSelectedId(null);
    setHoveredId(null);
    setTip(null);
  };

  return (
    <div className="rack-wrap">
      <header className="rack-header">
        <div>
          <div className="rack-eyebrow"><span className="rack-live-dot" /> Athion homelab / infrastructure</div>
          <h1>Athion rack</h1>
          <p>Hardware, connections, and the UniFi upgrade.</p>
        </div>
        <div className="rack-toggle" role="group" aria-label="Layout">
          <button aria-pressed={mode === "before"} className={mode === "before" ? "on" : ""} onClick={() => switchMode("before")}>
            Previous · TP-Link
          </button>
          <button aria-pressed={mode === "after"} className={mode === "after" ? "on" : ""} onClick={() => switchMode("after")}>
            Plan · UniFi
          </button>
        </div>
      </header>

      <section className="rack-ownership" aria-label="Confirmed network inventory">
        <div><b>Owned network gear</b><span>{OWNED_NETWORK.join(" · ")}</span></div>
        <p>The panel is blank today. The U7 Pro Max, 24 couplers, and 24 short patch cables are in your cart. The UniFi viewer shows the completed plan, including cables still to buy. <a href="#rack-shopping">See what is missing →</a></p>
      </section>
      <div className="rack-stage">
        <div className="rack-view-wrap" ref={stageRef}>
          <div className="rack-view-toolbar">
            <div className="rack-view-presets" role="group" aria-label="Camera view">
              {([['equipment', 'Equipment'], ['overview', 'Overview'], ['front', 'Front'], ['rear', 'Rear']] as const).map(([preset, title]) => (
                <button key={preset} aria-pressed={view.preset === preset} onClick={() => setView({ preset, n: view.n + 1 })}>{title}</button>
              ))}
            </div>
            <button className="rack-expand" aria-label="Toggle fullscreen viewer" onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void stageRef.current?.requestFullscreen?.().catch(() => {});
            }} title="Fullscreen">⛶</button>
          </div>
          <div className="rack-scene-caption"><b>LINIER <span>42U</span></b><span>24 × 24 in · {mode === 'after' ? 'UniFi upgrade' : 'Previous layout'}</span></div>
          <RackScene
            mode={mode}
            selectedId={selectedId}
            hoveredId={hoveredId}
            pathIds={pathIds}
            sidePanels={sidePanels}
            doors={doors}
            showCables={showCables}
            labels={labels}
            view={view}
            onHover={onHover}
            onSelect={onSelect}
            onLoadState={setLoadState}
          />
          {tip && showCables && (
            <div className="rack-tip" style={{ left: tip.x, top: tip.y }}>{tip.text}</div>
          )}
          {loadState === "unavailable" && <div className="rack-unavailable">3D rendering is unavailable in this browser. The cable schedule and hardware plan are available below.</div>}
          <div className="rack-view-bottom">
            <div className="rack-display-controls" role="group" aria-label="Scene layers">
              {([
                ['Cables', showCables, () => setShowCables((v) => !v)],
                ['Labels', labels, () => setLabels((v) => !v)],
                ['Side panels', sidePanels, () => setSidePanels((v) => !v)],
                ['Doors', doors, () => setDoors((v) => !v)],
              ] as const).map(([title, enabled, toggle]) => <button key={title} aria-pressed={enabled} onClick={toggle}><i />{title}</button>)}
            </div>
            <div className="rack-legend" aria-label="Cable colors">
              {LEGEND.filter((l) => l.key !== 'OFF').map((l) => (
                <div key={l.key}><i style={{ background: l.key === "AC" ? "#758195" : CSS_COLORS[l.key] }} />{l.label}</div>
              ))}
            </div>
            <div className="rack-hint"><span>Drag to orbit · Scroll to zoom · Click a cable</span><span role="status">{loadState === "loading" ? "Loading models…" : loadState === "loaded" ? "Models ready" : loadState === "fallback" ? "Simplified models" : "3D unavailable"}</span></div>
          </div>
        </div>
        <aside className="rack-sched">
          <div className="rack-sched-h">
            <h2>{mode === "after" ? "Planned cable schedule" : "Previous cabling"}</h2>
            <span>{cableCount(list)} cables</span>
          </div>
          <div className="rack-schedule-filters" role="group" aria-label="Cable category">
            {([["all", "All"], ["peripherals", "Display & USB"], ["power", "Power"]] as const).map(([value, title]) => <button key={value} aria-pressed={filter === value} onClick={() => { setFilter(value); setSelectedId(null); setHoveredId(null); }}>{title}</button>)}
          </div>
          <Schedule list={visibleList} selectedId={selectedId} onSelect={(id) => { setTraceFlow(false); setSelectedId(id); }} onHover={setHoveredId} />
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

      <SpeedFlow onTrace={() => { setTraceFlow(true); setSelectedId(null); setHoveredId(null); setShowCables(true); stageRef.current?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" }); }} mode={mode} source={flowSource} target={flowTarget} onSource={(id) => { setFlowSource(id); setTraceFlow(true); setSelectedId(null); setShowCables(true); }} onTarget={(target) => { setFlowTarget(target); setTraceFlow(true); setSelectedId(null); setShowCables(true); }} />
      <section className="rack-pc-connections" aria-label="PC cable inventory">
        {([["SPC", "Sam's PC", "HDMI to display · USB-C to hub"], ["GPC", "Gaming PC", "DisplayPort to display · USB to hub"], ["SRV", "Remote server", "Headless · no display or USB run"]] as const).map(([id, name, detail]) => {
          const cables = list.filter((c) => c.from?.[0] === id || c.to?.[0] === id);
          return <div key={id}><div><b>{name}</b><span>{cableCount(cables)} cables</span></div><p>Power + Ethernet</p><p>{detail}</p></div>;
        })}
      </section>
      <p className="rack-schematic-note">Desk endpoints and PC port locations are schematic. Display and USB lengths: measure on site. Hub-to-peripheral leads and desk power stay outside this rack inventory.</p>
      <details className="rack-context"><summary>About this rack</summary><p>{LEAD}</p></details>
      <Rationale />
      <PortMap />
      <Bom />
      <Steps />
    </div>
  );
}
