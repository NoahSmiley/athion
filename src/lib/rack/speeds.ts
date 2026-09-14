import { SCHEDULE, type Cable } from "./cables";
import type { Mode } from "./geometry";

export type FlowTarget = "internet" | "server";
export interface NetworkEndpoint { id: string; name: string; cables: string[]; port: string; note: string }
export function networkEndpoints(mode: Mode): NetworkEndpoint[] {
  if (mode === "before") return [
    { id: "SRV", name: "Remote server", cables: ["B3"], port: "TP-Link LAN 1", note: "5 GbE NIC · previously verified at 1 GbE" },
    { id: "GPC", name: "Gaming PC", cables: ["B4"], port: "TP-Link LAN 2", note: "1 GbE router port · client negotiation unverified" },
    { id: "SPC", name: "Sam's PC", cables: ["B5"], port: "TP-Link LAN 3", note: "1 GbE router port · client negotiation unverified" },
  ];
  return [
    { id: "SRV", name: "Remote server", cables: ["C4", "P1"], port: "Port 17 · panel 17", note: "5 GbE NIC → 2.5 GbE switch port" },
    { id: "GPC", name: "Gaming PC", cables: ["C5", "P2"], port: "Port 18 · panel 18", note: "2.5 GbE NIC assumed · confirm motherboard" },
    { id: "SPC", name: "Sam's PC", cables: ["C6", "P3"], port: "Port 19 · panel 19", note: "2.5 GbE NIC assumed · confirm motherboard" },
    { id: "AP", name: "U7 Pro / Wi-Fi", cables: ["H1", "P4"], port: "Port 20 · panel 20", note: "2.5 GbE wired backhaul · Wi-Fi clients vary" },
    { id: "TV", name: "TV drop", cables: ["H2", "P9"], port: "Port 9 · panel 9", note: "1 GbE port ceiling · endpoint may link lower" },
    { id: "OFFICE", name: "Office drop", cables: ["H3", "P10"], port: "Port 10 · panel 10", note: "1 GbE port ceiling · dock unverified" },
  ];
}

const rates: Partial<Record<Cable["speed"], number>> = { "1G": 1, "2.5G": 2.5, "10G": 10 };
export function cableCeiling(mode: Mode, ids: string[]): number | null {
  if (!ids.length) return null;
  const values = ids.map((id) => rates[SCHEDULE[mode].find((c) => c.id === id)?.speed as Cable["speed"]]);
  return values.some((v) => v === undefined) ? null : Math.min(...values as number[]);
}

/** Same-subnet LAN transfers bypass the router. These are planned physical ceilings, never telemetry. */
export function speedPath(mode: Mode, source: string, target: FlowTarget) {
  const endpoints = networkEndpoints(mode);
  const endpoint = endpoints.find((e) => e.id === source) ?? endpoints[1];
  const local = target === "server";
  const destination = endpoints.find((e) => e.id === "SRV")!;
  const ids = local ? endpoint.id === "SRV" ? [] : [...endpoint.cables, ...destination.cables]
    : [...endpoint.cables, ...(mode === "after" ? ["C3", "C2"] : ["B2"])];
  return { endpoint, ids, ceiling: cableCeiling(mode, ids), access: cableCeiling(mode, endpoint.cables),
    steps: local ? endpoint.id === "SRV" ? ["Remote server · same device"] : [endpoint.name, mode === "after" ? "Pro Max switch" : "TP-Link LAN switch", "Remote server"]
      : [endpoint.name, ...(mode === "after" ? ["Pro Max switch", "UDM Pro", "UCI modem"] : ["TP-Link", "Spectrum modem"]), "Internet"] };
}
