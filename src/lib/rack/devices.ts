// Devices in the cabinet, top to bottom, per mode. `u` is the top rack unit a device occupies, `h` its height in U.
// Procedural kinds are drawn from spec in `scene/devices.ts`; kinds with `glb` load Ubiquiti's own product model from
// /public/rack/models (Draco already decoded, buffers embedded) and use `hint`/`flip` to decide which face is the front.
import { FR, U, W19, yOf, type Mode } from "./geometry";

export type DeviceKind = "pdu" | "pp" | "sw" | "udm" | "uci" | "brush" | "rm" | "tpl" | "mdm" | "ap";

export interface Device {
  id: string;
  kind: DeviceKind;
  name: string;
  /** Top rack unit (1 = top of cabinet). Not used for the ceiling AP. */
  u?: number;
  /** Height in rack units. */
  h?: number;
  /** Chassis depth in scene units (100 mm). */
  d?: number;
  /** Front-panel label for procedural chassis. */
  label?: string;
  /** Path to a glTF model under /public. */
  glb?: string;
  /** How to find the front face of a loaded model: 'density' (the face with more geometry) or a node name that lives on the front. */
  hint?: "density" | string;
  /** Invert the front-face decision for a specific model. */
  flip?: boolean;
}

const COMPUTERS: Device[] = [
  { id: "SRV", u: 6, h: 4, d: 4.68, kind: "rm", name: "Proxmox server · SilverStone RM44", label: "RM44  ·  HOMELAB" },
  { id: "SPC", u: 10, h: 4, d: 4.68, kind: "rm", name: "Sam's PC · SilverStone RM44", label: "RM44  ·  SAM" },
  { id: "GPC", u: 14, h: 5, d: 4.85, kind: "rm", name: "Gaming PC · SilverStone RM51", label: "RM51  ·  GAMING" },
];

export function devicesFor(mode: Mode): Device[] {
  const network: Device[] =
    mode === "after"
      ? [
          { id: "PDU", u: 1, h: 1, kind: "pdu", name: "Tripp Lite PDUMH20 metered PDU" },
          { id: "PP", u: 2, h: 1, kind: "pp", name: "UniFi 24-slot keystone patch panel" },
          { id: "SW", u: 3, h: 1, kind: "sw", name: "USW Pro Max 24 PoE", glb: "/rack/models/sw.gltf", hint: "density" },
          { id: "UDM", u: 4, h: 1, kind: "udm", name: "UDM Pro", glb: "/rack/models/udm.gltf", hint: "density" },
          { id: "UCI", u: 5, h: 1, kind: "uci", name: "UCI cable modem", glb: "/rack/models/uci.gltf", hint: "LCM.001" },
          { id: "AP", kind: "ap", name: "UniFi U7 Pro access point", glb: "/rack/models/u7.gltf" },
        ]
      : [
          { id: "PDU", u: 1, h: 1, kind: "pdu", name: "Tripp Lite PDUMH20 metered PDU" },
          { id: "PP", u: 2, h: 1, kind: "pp", name: "Patch panel (unused today)" },
          { id: "TPL", u: 4, h: 1, kind: "tpl", name: "TP-Link router on a shelf" },
          { id: "MDM", u: 5, h: 1, kind: "mdm", name: "Spectrum modem on a shelf" },
        ];
  return network.concat(COMPUTERS);
}

/**
 * Front-face anchors calibrated against the bundled glTF socket geometry (100 mm units).
 * fx runs left to right across the 442 mm face, fy bottom to top across the 1U height.
 */
const fx = (x: number) => 0.5 + x / W19;
const fy = (y: number) => y / U;
const switchPort = (i: number): [number, number] => [fx([-1.2687, -0.0961, 1.0764][Math.floor(i / 8)] + (i % 8 - 3.5) * 0.1425), fy(0.1635)];

export const FACE = {
  pdu: { outletCount: 12, outletX: (i: number) => -1.661 + i * 0.302, inletX: -2.01 },
  sw: {
    ports: switchPort,
    sfp: [
      [fx(1.7639), fy(0.1445)],
      [fx(1.9239), fy(0.1445)],
    ] as [number, number][],
    screen: [0.03, 0.5] as [number, number],
    iec: fx(-1.771),
  },
  udm: {
    ports: (i: number): [number, number] => [fx([0.951, 1.109, 1.267, 1.425][Math.floor(i / 2)]), fy(i % 2 ? 0.1546 : 0.2904)],
    wan: [fx(1.735), fy(0.160)] as [number, number],
    sfp: [
      [fx(1.922), fy(0.3034)],
      [fx(1.922), fy(0.142)],
    ] as [number, number][],
    screen: [0.04, 0.5] as [number, number],
    hdd: [0.42, 0.66] as [number, number],
    iec: fx(-1.771),
  },
  uci: {
    port: [fx(1.7362), fy(0.1615)] as [number, number],
    screen: [0.04, 0.5] as [number, number],
    coaxRear: [0.5, fy(0.1615)] as [number, number],
    iec: fx(-1.771),
  },
  /** Keystone openings sit directly above the switch ports so every panel-to-switch cord is identical. */
  pp: { slot: switchPort },
  /** Model depths in scene units, used to place rear anchors. */
  depth: { sw: 3.252, udm: 2.8775, uci: 0.93235, pp: 0.24, pdu: 1.14 },
};

/** Published chassis sizes, centered in their allotted rack units. */
export function chassisPlacement(d: Device) {
  const depth = d.d ?? 4.68;
  const units = d.h ?? 4;
  return { width: 4.4, height: units === 5 ? 2.2 : 1.76, depth,
    y: yOf((d.u ?? 6) + units - 1) + units * U / 2,
    z: FR + 0.02 - depth / 2 };
}
