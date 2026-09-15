import { cableCeiling, networkEndpoints, speedPath, type FlowTarget } from "@/lib/rack/speeds";
import type { Mode } from "@/lib/rack/geometry";

interface Props { mode: Mode; source: string; target: FlowTarget; onSource: (id: string) => void; onTarget: (target: FlowTarget) => void; onTrace: () => void }
export function SpeedFlow({ mode, source, target, onSource, onTarget, onTrace }: Props) {
  const plan = mode === "after";
  const path = speedPath(mode, source, target);
  const local = target === "server";
  return <section className="rack-section rack-speed-flow" aria-labelledby="speed-flow-title">
    <div className="rack-flow-heading"><div><div className="rack-eyebrow">Network paths · {plan ? "planned link ceilings" : "previous layout ceilings"}</div><h2 id="speed-flow-title">Where the speed goes</h2></div>
      <div className="rack-toggle" role="group" aria-label="Traffic destination">
        <button aria-pressed={!local} className={!local ? "on" : ""} onClick={() => onTarget("internet")}>To Internet</button>
        <button aria-pressed={local} className={local ? "on" : ""} onClick={() => onTarget("server")}>To server · LAN</button>
      </div>
    </div>
    <p className="rack-intro">Select a device to trace its cables in the rack. Rates are link ceilings; actual transfers are lower. No live traffic is being measured.</p>
    <div className={`rack-flow-upstream${local ? " is-bypassed" : ""}`} aria-label="Shared Internet path">
      <div className="rack-flow-node"><b>Spectrum Internet</b><span>Download / upload unverified</span></div>
      <div className="rack-flow-link"><span>DOCSIS</span><i aria-hidden="true">↔</i></div>
      <div className="rack-flow-node"><b>{plan ? "UCI modem" : "Spectrum modem"}</b><span>{plan ? "2.5 GbE capable" : "ISP modem"}</span></div>
      <div className="rack-flow-link wan"><span>1 Gb/s</span><i aria-hidden="true">↔</i><small>Shared WAN limit</small></div>
      <div className="rack-flow-node"><b>{plan ? "UDM Pro" : "TP-Link router"}</b><span>{plan ? "Port 9 · 1 GbE WAN" : "Gigabit WAN + LAN"}</span></div>
    </div>
    <div className={`rack-flow-trunk${local ? " is-bypassed" : ""}`}>
      <svg viewBox="0 0 1000 64" preserveAspectRatio="none" aria-hidden="true"><path className="trunk-desktop" d="M 900 0 V 42 H 500 V 64" /><path className="trunk-mobile" d="M 500 0 V 64" /></svg>
      <span>{plan ? <><b>10 Gb/s</b> shared DAC · switch 26 ↔ UDM 11</> : "Internal LAN switch"}</span>
    </div>
    <div className="rack-flow-switch"><b>{plan ? "USW Pro Max 24 PoE" : "TP-Link LAN switch"}</b><span>{local ? "Local traffic stays here · same subnet / VLAN" : "Each device has its own access link"}</span></div>
    <div className="rack-flow-devices" role="group" aria-label="Source device">
      {networkEndpoints(mode).map((device) => { const rate = cableCeiling(mode, device.cables); return <button key={device.id} aria-pressed={path.endpoint.id === device.id} onClick={() => onSource(device.id)} className={rate === 2.5 ? "multi-gig" : "gigabit"}>
        <span className="rack-flow-access"><i aria-hidden="true">↕</i>{rate} Gb/s{device.id === "AP" ? " wired" : ""}</span><b>{device.name}</b><span>{device.port}</span>
      </button>; })}
    </div>
    <div className="rack-flow-result" aria-live="polite">
      <div><span>{path.steps.join(" → ")}</span><strong>{path.ceiling === null ? "No network transfer" : `Up to ${path.ceiling} Gb/s ${local ? "on this LAN path" : "wired path ceiling"}`}</strong></div>
      <p>{path.endpoint.note}. {local ? path.ceiling === null ? "Choose another device to see its path to the server." : "The slower endpoint link sets the ceiling. Storage, protocol overhead and competing traffic can reduce transfers." : "The 1 GbE modem-to-router link is shared by all devices; your ISP tier or upload rate may impose a lower limit."}{path.endpoint.id === "AP" ? " Wi-Fi throughput also depends on the client, band, signal and airtime; 2.5 Gb/s is not a per-client promise." : ""}</p>
    </div>
    {path.ids.length > 0 && <button className="rack-flow-trace" onClick={onTrace}>View this path in 3D ↑</button>}
    <p className="rack-schematic-note">HDMI, DisplayPort and USB hub leads are separate from Ethernet. Their versions and bandwidth are unspecified. {plan ? <><a href="https://techspecs.ui.com/unifi/switching/usw-pro-max-24-poe" target="_blank" rel="noreferrer">Switch specifications</a> · <a href="https://techspecs.ui.com/unifi/cloud-gateways/udm-pro" target="_blank" rel="noreferrer">Gateway specifications</a></> : "Other TP-Link wireless clients are not inventoried."}</p>
  </section>;
}
