// Devices in the cabinet, top to bottom, per mode. `u` is the top rack unit a device occupies, `h` its height in U.
// Procedural kinds are drawn from spec in `scene/devices.ts`; kinds with `glb` load Ubiquiti's own product model from
// /public/rack/models (Draco already decoded, buffers embedded) and use `hint`/`flip` to decide which face is the front.
import { FR, U, yOf, type Mode } from "./geometry";

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
          { id: "UCI", u: 5, h: 1, kind: "uci", name: "UCI cable modem", glb: "/rack/models/uci.gltf", hint: "LCM.001", flip: true },
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
 * Front-face anchor fractions measured from Ubiquiti's product photos.
 * fx runs left to right across the 442 mm face, fy bottom to top across the 1U height.
 */
export const FACE = {
  pdu: { outletCount: 12, outletX: (i: number) => -1.661 + i * 0.302, inletX: -2.01 },
  sw: {
    ports: (i: number): [number, number] => [0.085 + (i * (0.845 - 0.085)) / 23, 0.5],
    sfp: [
      [0.885, 0.5],
      [0.925, 0.5],
    ] as [number, number][],
    screen: [0.03, 0.5] as [number, number],
    iec: 0.1,
  },
  udm: {
    ports: (i: number): [number, number] => [[0.714, 0.751, 0.789, 0.826][Math.floor(i / 2)], i % 2 ? 0.3 : 0.68],
    wan: [0.883, 0.43] as [number, number],
    sfp: [
      [0.926, 0.68],
      [0.926, 0.3],
    ] as [number, number][],
    screen: [0.04, 0.5] as [number, number],
    hdd: [0.42, 0.66] as [number, number],
    iec: 0.12,
  },
  uci: {
    port: [0.89, 0.5] as [number, number],
    screen: [0.04, 0.5] as [number, number],
    coaxRear: [0.5, 0.5] as [number, number],
    iec: 0.13,
  },
  /** Keystone openings sit directly above the switch ports so every panel-to-switch cord is identical. */
  pp: { slot: (i: number): [number, number] => [0.085 + (i * (0.845 - 0.085)) / 23, 0.5] },
  /** Model depths in scene units, used to place rear anchors. */
  depth: { sw: 3.25, udm: 2.86, uci: 2.6, pp: 0.24, pdu: 1.14 },
};

/** Published chassis sizes, centered in their allotted rack units. */
export function chassisPlacement(d: Device) {
  const depth = d.d ?? 4.68;
  const units = d.h ?? 4;
  return { width: 4.4, height: units === 5 ? 2.2 : 1.76, depth,
    y: yOf((d.u ?? 6) + units - 1) + units * U / 2,
    z: FR + 0.02 - depth / 2 };
}
