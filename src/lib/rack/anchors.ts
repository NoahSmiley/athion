// Computes every connection point (port, jack, inlet) in world space from the device list alone.
// The 3D models are decorative: cables and Etherlighting attach to these anchors, not to model geometry,
// so a missing or differently oriented model never breaks the plan.
import { AP_POS, DESK_ENDPOINTS, ENTRY_POINTS, FR, U, W19, yOf, type Vec3, v3 } from "./geometry";
import { FACE, chassisPlacement, type Device } from "./devices";

export interface DeviceAnchors {
  /** RJ45 ports (switch 0-23, UDM Pro 0-7, UCI 0, patch panel front slots 0-23, TP-Link 0-3). */
  p: Vec3[];
  /** SFP+ cages. */
  sfp: Vec3[];
  /** Patch panel keystone/coupler side (rear). */
  rear: Vec3[];
  /** PDU rear outlets 0-11. */
  out: Vec3[];
  wan?: Vec3;
  coax?: Vec3;
  /** IEC power inlet on the rear of network gear. */
  iec?: Vec3;
  /** Onboard NIC on a chassis rear I/O shield. */
  nic?: Vec3;
  /** PSU inlet on a chassis rear. */
  psu?: Vec3;
  /** PDU inlet cord. */
  inlet?: Vec3;
  /** Access point port. */
  port?: Vec3;
  /** Schematic rear GPU output and USB upstream ports. Only present on the two interactive PCs. */
  display?: Vec3;
  usb?: Vec3;
  power?: Vec3;
  /** Top cable access slots (ENTRY pseudo-device). */
  pt?: Vec3[];
}

export type AnchorMap = Record<string, DeviceAnchors>;

const empty = (): DeviceAnchors => ({ p: [], sfp: [], rear: [], out: [] });

/** A point on (or behind) a 1U device face. */
function faceAnchor(d: Device, fx: number, fy: number, depth?: number, rear = false): Vec3 {
  const y = yOf(d.u ?? 1) + fy * U;
  const z = rear ? FR + 0.02 - (depth ?? 0) : FR + 0.02;
  return v3(-W19 / 2 + fx * W19, y, z);
}

export function computeAnchors(devices: Device[]): AnchorMap {
  const map: AnchorMap = { ENTRY: { ...empty(), pt: ENTRY_POINTS.map((p) => ({ ...p })) } };
  for (const desk of DESK_ENDPOINTS) {
    map[desk.id] = { ...empty(), display: { ...desk.position }, usb: { ...desk.position, y: desk.position.y - 0.45 } };
  }
  for (const d of devices) {
    const P = empty();
    map[d.id] = P;
    switch (d.kind) {
      case "sw": {
        for (let i = 0; i < 24; i++) P.p[i] = faceAnchor(d, ...FACE.sw.ports(i));
        FACE.sw.sfp.forEach(([fx, fy], i) => (P.sfp[i] = faceAnchor(d, fx, fy)));
        P.iec = faceAnchor(d, FACE.sw.iec, 0.5, FACE.depth.sw, true);
        break;
      }
      case "udm": {
        for (let i = 0; i < 8; i++) P.p[i] = faceAnchor(d, ...FACE.udm.ports(i));
        P.wan = faceAnchor(d, ...FACE.udm.wan);
        FACE.udm.sfp.forEach(([fx, fy], i) => (P.sfp[i] = faceAnchor(d, fx, fy)));
        P.iec = faceAnchor(d, FACE.udm.iec, 0.5, FACE.depth.udm, true);
        break;
      }
      case "uci": {
        P.p[0] = faceAnchor(d, ...FACE.uci.port);
        P.coax = faceAnchor(d, ...FACE.uci.coaxRear, FACE.depth.uci, true);
        P.iec = faceAnchor(d, FACE.uci.iec, 0.5, FACE.depth.uci, true);
        break;
      }
      case "pp": {
        const u = d.u ?? 2;
        for (let i = 0; i < 24; i++) {
          const [fx] = FACE.pp.slot(i);
          const x = -W19 / 2 + fx * W19;
          P.p[i] = v3(x, yOf(u) + U / 2 - 0.01, FR + 0.06);
          P.rear[i] = v3(x, yOf(u) + U / 2, FR + 0.02 - 0.12 - 0.42);
        }
        break;
      }
      case "pdu": {
        const u = d.u ?? 1;
        const dep = FACE.depth.pdu;
        const cy = yOf(u) + U / 2;
        const cz = FR + 0.02 - dep / 2;
        for (let i = 0; i < FACE.pdu.outletCount; i++) P.out[i] = v3(FACE.pdu.outletX(i), cy, cz - dep / 2 - 0.03);
        P.inlet = v3(FACE.pdu.inletX, cy, cz - dep / 2 - 0.1);
        break;
      }
      case "rm": {
        const { height: h, depth: dep, y: cy, z: cz } = chassisPlacement(d);
        P.nic = v3(-1.2, cy + h / 2 - 0.45, cz - dep / 2 - 0.05);
        P.psu = v3(-1.75, cy - h / 2 + 0.55, cz - dep / 2 - 0.05);
        if (d.id === "SPC" || d.id === "GPC") {
          P.display = v3(0.9, cy + h / 2 - 0.55, cz - dep / 2 - 0.06);
          P.usb = v3(-0.65, cy + h / 2 - 0.5, cz - dep / 2 - 0.06);
        }
        break;
      }
      case "tpl": {
        const cy = yOf(d.u ?? 4) + U / 2;
        const cz = FR + 0.02 - 1.0;
        for (let i = 0; i < 4; i++) P.p[i] = v3(-1.7 + i * 0.18, cy, cz - 0.85 - 0.03);
        P.wan = v3(-0.6, cy, cz - 0.85 - 0.03);
        P.power = v3(-0.1, cy, cz - 0.85 - 0.03);
        break;
      }
      case "mdm": {
        const cy = yOf(d.u ?? 5) + U / 2;
        const cz = FR + 0.02 - 1.0;
        P.p[0] = v3(-0.3, cy, cz - 0.85 - 0.03);
        P.coax = v3(-1.6, cy, cz - 0.85 - 0.05);
        P.power = v3(-0.1, cy, cz - 0.85 - 0.03);
        break;
      }
      case "ap": {
        P.port = { ...AP_POS };
        break;
      }
      default:
        break;
    }
  }
  return map;
}

/** Resolve a cable Ref against the anchor map. Throws on a bad reference so mistakes surface at build time. */
export function resolveRef(map: AnchorMap, ref: [string, (string | number)?, number?]): Vec3 {
  const [id, kindRaw, idx] = ref;
  const dev = map[id];
  if (!dev) throw new Error(`rack: unknown device "${id}" in cable ref`);
  if (id === "ENTRY") return dev.pt![typeof kindRaw === "number" ? kindRaw : (idx ?? 0)];
  const kind = typeof kindRaw === "string" ? kindRaw : undefined;
  const list = kind === "p" ? dev.p : kind === "sfp" ? dev.sfp : kind === "rear" ? dev.rear : kind === "out" ? dev.out : null;
  if (list) {
    const p = list[idx ?? 0];
    if (!p) throw new Error(`rack: ${id}.${kind}[${idx}] does not exist`);
    return p;
  }
  const p = (dev as unknown as Record<string, Vec3 | undefined>)[kind ?? ""];
  if (!p) throw new Error(`rack: ${id}.${kind} does not exist`);
  return p;
}
