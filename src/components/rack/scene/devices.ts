import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AP_POS, FR, U, W19, yOf } from "@/lib/rack/geometry";
import { FACE, chassisPlacement, type Device } from "@/lib/rack/devices";
import { computeAnchors, type AnchorMap } from "@/lib/rack/anchors";
import { box, plane, roundedBox, textMaterial } from "./labels";
import type { Materials } from "./materials";

import { buildPdu } from "./pdu";
import { addChassisFront } from "./chassis";

const loader = new GLTFLoader();

export interface DeviceHandles {
  /** Group in front of each network device's face; Etherlighting frames and link LEDs are added here. */
  overlays: Record<string, THREE.Group>;
  /** One promise per glTF model; resolves when the model is placed (or a stand-in is drawn). */
  pending: Promise<void>[];
}

function rj45(g: THREE.Group, x: number, y: number, z: number, M: Materials) {
  const m = box(0.118, 0.115, 0.05, M.port);
  m.position.set(x, y, z);
  g.add(m);
}
function ears(g: THREE.Group, h: number, M: Materials) {
  for (const sd of [-1, 1]) {
    const e = box(0.2, h, 0.05, M.silverDark);
    e.position.set(sd * (W19 / 2 - 0.1), 0, 0);
    g.add(e);
  }
}

/** GLTFLoader sanitizes dots in node.name but preserves the source name in userData. */
export function modelNode(root: THREE.Object3D, name: string): THREE.Object3D | undefined {
  let found: THREE.Object3D | undefined;
  root.traverse((node) => { if (!found && (node.userData.name === name || node.name === name)) found = node; });
  return found;
}

/**
 * Ubiquiti's models come in arbitrary axis conventions. Map the largest extent to x (width), the smallest to y (height),
 * then pick the front face either by a named node that lives on the front or by geometric density (ports and screens
 * put more vertices on the front than the back).
 */
export function orientModel(obj: THREE.Object3D, hint: string | undefined, flip?: boolean): THREE.Group {
  obj.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(obj);
  const sz = b.getSize(new THREE.Vector3());
  const arr = [sz.x, sz.y, sz.z];
  const hi = arr.indexOf(Math.min(...arr));
  const wi = arr.indexOf(Math.max(...arr));
  const di = [0, 1, 2].find((i) => i !== hi && i !== wi)!;
  const ax = (i: number) => new THREE.Vector3(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
  const ex = ax(wi);
  const ey = ax(hi);
  const ez = ax(di);
  if (new THREE.Vector3().crossVectors(ex, ey).dot(ez) < 0) ez.negate();
  const m = new THREE.Matrix4().makeBasis(ex, ey, ez).transpose();
  const g = new THREE.Group();
  g.quaternion.setFromRotationMatrix(m);
  g.add(obj);
  g.updateMatrixWorld(true);
  let frontIsPlusZ = true;
  const gb = new THREE.Box3().setFromObject(g);
  const mid = (gb.min.z + gb.max.z) / 2;
  if (hint && hint !== "density") {
    const n = modelNode(obj, hint);
    if (n) {
      const c = new THREE.Box3().setFromObject(n).getCenter(new THREE.Vector3());
      frontIsPlusZ = c.z > mid;
    }
  } else {
    let lo = 0;
    let hi2 = 0;
    const t = (gb.max.z - gb.min.z) * 0.1;
    const v = new THREE.Vector3();
    obj.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      const p = mesh.geometry.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i += 3) {
        v.fromBufferAttribute(p, i).applyMatrix4(mesh.matrixWorld);
        if (v.z < gb.min.z + t) lo++;
        else if (v.z > gb.max.z - t) hi2++;
      }
    });
    frontIsPlusZ = hi2 >= lo;
  }
  if (flip) frontIsPlusZ = !frontIsPlusZ;
  if (!frontIsPlusZ) {
    g.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI);
    g.updateMatrixWorld(true);
  }
  return g;
}

/** Scale a 1U model to 43.7 mm tall and mount it on the front rail of its rack unit. */
export function placeRackModel(g: THREE.Group, d: Device) {
  g.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(g);
  const sz = b.getSize(new THREE.Vector3());
  g.scale.setScalar(0.437 / sz.y);
  g.updateMatrixWorld(true);
  const b2 = new THREE.Box3().setFromObject(g);
  const c = b2.getCenter(new THREE.Vector3());
  g.position.add(new THREE.Vector3(-c.x, yOf(d.u ?? 1) + 0.004 - b2.min.y, FR + 0.02 - b2.max.z));
  g.updateMatrixWorld(true);
}

/** Scale the U7 Pro to 206 mm across, LED face down, and hang it from the ceiling slab. */
export function placeAP(g: THREE.Group) {
  g.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(g);
  const sz = b.getSize(new THREE.Vector3());
  g.scale.setScalar(2.06 / Math.max(sz.x, sz.z));
  g.updateMatrixWorld(true);
  const fc = modelNode(g, "Front_Case.001") || modelNode(g, "Front_Case");
  const b2 = new THREE.Box3().setFromObject(g);
  const mid = (b2.min.y + b2.max.y) / 2;
  if (fc) {
    const c = new THREE.Box3().setFromObject(fc).getCenter(new THREE.Vector3());
    if (c.y > mid) {
      g.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI);
      g.updateMatrixWorld(true);
    }
  }
  const b3 = new THREE.Box3().setFromObject(g);
  const c3 = b3.getCenter(new THREE.Vector3());
  g.position.add(new THREE.Vector3(AP_POS.x - c3.x, AP_POS.y - b3.max.y, AP_POS.z - c3.z));
  g.updateMatrixWorld(true);
}

/** Refine defaults from the actual, mounted socket meshes before routing. */
export function calibrateSockets(g: THREE.Group, d: Device, anchors: AnchorMap) {
  const target = anchors[d.id];
  const socket = (name: string, side: "front" | "rear" | "top") => {
    const mesh = modelNode(g, name);
    if (!mesh) throw new Error(`rack: missing ${d.id} socket ${name}`);
    const b = new THREE.Box3().setFromObject(mesh);
    const p = b.getCenter(new THREE.Vector3());
    if (side === "top") p.y = b.max.y;
    else p.z = side === "front" ? b.max.z : b.min.z;
    return { x: p.x, y: p.y, z: p.z };
  };
  if (d.kind === "sw") {
    ["metal.002", "metal.001", "metal"].forEach((name, group) => {
      const center = socket(name, "front");
      for (let i = 0; i < 8; i++) target.p[group * 8 + i] = { ...center, x: center.x + (i - 3.5) * 0.1425 };
    });
    target.sfp = [socket("sfp.001", "front"), socket("sfp", "front")];
    target.iec = socket("black", "rear");
  } else if (d.kind === "uci") {
    target.p[0] = socket("Port_Metal", "front");
    target.iec = socket("Rear_Plug", "rear");
    target.coax = socket("Cable_Screw", "rear");
  } else if (d.kind === "ap") {
    target.port = socket("Metal_Ether.001", "top");
  }
}

function tuneMaterials(scene: THREE.Object3D, intensity: number) {
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    for (const m of (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as THREE.MeshStandardMaterial[]) {
      m.envMapIntensity = intensity;
      if (m.metalness === undefined || m.metalness > 0.75) m.metalness = 0.7;
      if (m.roughness !== undefined && m.roughness < 0.3 && !m.roughnessMap) m.roughness = 0.3;
      m.needsUpdate = true;
    }
  });
}

/** To-spec stand-in with the same port layout, used only if a model fails to load. */
function drawStandIn(d: Device, holder: THREE.Group, depth: number, M: Materials) {
  const g = new THREE.Group();
  const h = U - 0.05;
  g.position.set(0, yOf(d.u ?? 1) + U / 2, FR + 0.02 - depth / 2);
  holder.add(g);
  g.add(box(W19 - 0.2, h, depth, M.silver));
  ears(g, h, M);
  const fz = depth / 2;
  const x = (fx: number) => -W19 / 2 + fx * W19;
  if (d.kind === "sw") {
    const scr = plane(0.32, 0.24, M.screen);
    scr.position.set(x(FACE.sw.screen[0]) + 0.1, 0, fz + 0.002);
    g.add(scr);
    for (let i = 0; i < 24; i++) rj45(g, x(FACE.sw.ports(i)[0]), (FACE.sw.ports(i)[1] - 0.5) * U, fz, M);
    for (const [fx, fy] of FACE.sw.sfp) {
      const m = box(0.16, 0.13, 0.05, M.port);
      m.position.set(x(fx), (fy - 0.5) * U, fz);
      g.add(m);
    }
  } else if (d.kind === "udm") {
    const scr = plane(0.32, 0.24, M.screen);
    scr.position.set(x(FACE.udm.screen[0]) + 0.1, 0, fz + 0.002);
    g.add(scr);
    for (let i = 0; i < 8; i++) {
      const [fx, fy] = FACE.udm.ports(i);
      rj45(g, x(fx), (fy - 0.5) * U, fz, M);
    }
    rj45(g, x(FACE.udm.wan[0]), (FACE.udm.wan[1] - 0.5) * U, fz, M);
    for (const [fx, fy] of FACE.udm.sfp) {
      const m = box(0.16, 0.13, 0.05, M.port);
      m.position.set(x(fx), (fy - 0.5) * U, fz);
      g.add(m);
    }
    const hdd = box(1.05, h - 0.14, 0.02, M.silverDark);
    hdd.position.set(x(0.54), 0, fz);
    g.add(hdd);
  } else if (d.kind === "uci") {
    const scr = plane(0.32, 0.24, M.screen);
    scr.position.set(x(FACE.uci.screen[0]) + 0.1, 0, fz + 0.002);
    g.add(scr);
    rj45(g, x(FACE.uci.port[0]), (FACE.uci.port[1] - 0.5) * U, fz, M);
    const fc = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), M.rail);
    fc.rotation.x = Math.PI / 2;
    fc.position.set(0, 0, -fz);
    g.add(fc);
  }
  const anchor = computeAnchors([d])[d.id].iec;
  if (anchor) {
    const inlet = box(0.27, 0.18, 0.05, M.port);
    inlet.position.set(anchor.x, anchor.y, anchor.z);
    holder.add(inlet);
  }
}

export function buildDevices(root: THREE.Group, devices: Device[], anchors: AnchorMap, M: Materials): DeviceHandles {
  const overlays: Record<string, THREE.Group> = {};
  const pending: Promise<void>[] = [];

  for (const d of devices) {
    switch (d.kind) {
      case "sw":
      case "udm":
      case "uci": {
        const depth = FACE.depth[d.kind];
        const holder = new THREE.Group();
        root.add(holder);
        const ov = new THREE.Group();
        root.add(ov);
        overlays[d.id] = ov;
        pending.push(
          loader
            .loadAsync(d.glb!)
            .then((gltf) => {
              tuneMaterials(gltf.scene, 1.3);
              const g = orientModel(gltf.scene, d.hint, d.flip);
              placeRackModel(g, d);
              calibrateSockets(g, d, anchors);
              holder.add(g);
            })
            .catch((err) => {
              console.warn("rack: model failed, drawing stand-in", d.glb, String(err));
              drawStandIn(d, holder, depth, M);
              throw err;
            }),
        );
        break;
      }
      case "ap": {
        const holder = new THREE.Group();
        root.add(holder);
        pending.push(
          loader
            .loadAsync(d.glb!)
            .then((gltf) => {
              tuneMaterials(gltf.scene, 1.2);
              gltf.scene.traverse((o) => { o.castShadow = false; });
              const g = orientModel(gltf.scene, "density");
              placeAP(g);
              calibrateSockets(g, d, anchors);
              holder.add(g);
            })
            .catch((err) => {
              console.warn("rack: model failed, drawing stand-in", d.glb, String(err));
              const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.03, 0.98, 0.46, 48), M.keystone);
              disc.position.set(AP_POS.x, AP_POS.y - 0.23, AP_POS.z);
              holder.add(disc);
              const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.03, 8, 48), new THREE.MeshBasicMaterial({ color: 0x2f8cff }));
              ring.rotation.x = Math.PI / 2;
              ring.position.set(AP_POS.x, AP_POS.y - 0.47, AP_POS.z);
              holder.add(ring);
              throw err;
            }),
        );
        break;
      }
      case "pp": {
        // UniFi keystone panel: 1U extruded aluminium bar, 24 rectangular openings, rear cable bar.
        const g = new THREE.Group();
        const h = U - 0.05;
        g.position.set(0, yOf(d.u ?? 2) + U / 2, FR + 0.02 - 0.12);
        root.add(g);
        g.add(box(W19 - 0.2, h, 0.24, M.silver));
        ears(g, h, M);
        for (let i = 0; i < 24; i++) {
          const [fx] = FACE.pp.slot(i);
          const x = -W19 / 2 + fx * W19;
          const coupler = i >= 16 && i <= 18;
          const hole = box(0.15, 0.19, 0.05, M.keystone);
          hole.position.set(x, 0, 0.115);
          g.add(hole);
          const jack = box(0.12, 0.11, 0.02, M.port);
          jack.position.set(x, -0.01, 0.145);
          g.add(jack);
          const body = box(0.15, 0.19, 0.3, M.keystone);
          body.position.set(x, 0, -0.25);
          g.add(body);
          if (coupler) {
            const rj = box(0.12, 0.11, 0.02, M.port);
            rj.position.set(x, -0.01, -0.41);
            g.add(rj);
          } else {
            const cap = box(0.16, 0.07, 0.1, M.keystone);
            cap.position.set(x, 0.11, -0.32);
            g.add(cap);
          }
        }
        const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, W19 - 0.3, 12), M.silverDark);
        bar.rotation.z = Math.PI / 2;
        bar.position.set(0, -0.12, -0.62);
        g.add(bar);
        for (const sd of [-1, 1]) {
          const a = box(0.05, 0.26, 0.62, M.silverDark);
          a.position.set(sd * (W19 / 2 - 0.18), -0.05, -0.31);
          g.add(a);
        }
        const nm = plane(1.6, 0.09, textMaterial("UNIFI  ·  24-SLOT KEYSTONE PATCH PANEL", 1.6, 0.09, "#6d7684", null, 56));
        nm.position.set(0, -h / 2 + 0.035, 0.125);
        g.add(nm);
        break;
      }
      case "pdu": {
        buildPdu(root, d.u ?? 1, M);
        break;
      }
      case "brush": {
        const g = new THREE.Group();
        const h = U - 0.05;
        g.position.set(0, yOf(d.u ?? 1) + U / 2, FR + 0.02 - 0.03);
        root.add(g);
        g.add(box(W19 - 0.2, h, 0.06, M.black));
        ears(g, h, M);
        const b = plane(W19 - 0.8, h - 0.14, M.brush);
        b.position.set(0, 0, 0.032);
        g.add(b);
        break;
      }
      case "rm": {
        // SilverStone closed front doors: RM44 keyed grille, RM51 pull handle and lower I/O strip. Rear PC ports are schematic.
        const g = new THREE.Group();
        const { width: w, height: h, depth: dep, y: cy, z: cz } = chassisPlacement(d);
        const fz = dep / 2;
        g.position.set(0, cy, cz);
        root.add(g);
        const chassis = roundedBox(w, h, dep, M.black, 0.035);
        chassis.castShadow = true;
        chassis.receiveShadow = true;
        g.add(chassis);
        addChassisFront(g, w, h, fz, d.h === 5, M);
        const io = box(1.6, 0.45, 0.02, M.rail);
        io.position.set(-0.9, h / 2 - 0.5, -fz);
        g.add(io);
        const nic = box(0.14, 0.13, 0.06, M.port);
        nic.position.set(-1.2, h / 2 - 0.45, -fz - 0.02);
        g.add(nic);
        const psu = box(1.5, 0.86, 0.02, M.rail);
        psu.position.set(-1.2, -h / 2 + 0.55, -fz);
        g.add(psu);
        // Recessed PSU vents and rear exhaust distinguish the rear from a plain box.
        for (let i = 0; i < 9; i++) {
          const vent = box(0.045, 0.56, 0.008, M.port);
          vent.position.set(-1.47 + i * 0.1, -h / 2 + 0.55, -fz - 0.018);
          g.add(vent);
        }
        const exhaust = new THREE.Mesh(new THREE.CircleGeometry(0.43, 32), M.mesh);
        exhaust.rotation.y = Math.PI;
        exhaust.position.set(0.85, -h / 2 + 0.56, -fz - 0.018);
        g.add(exhaust);
        for (let i = -4; i <= 4; i++) {
          const y = i * 0.085;
          const vent = box(2 * Math.sqrt(0.43 ** 2 - y ** 2), 0.022, 0.012, M.hub);
          vent.position.set(0.85, -h / 2 + 0.56 + y, -fz - 0.03);
          g.add(vent);
        }
        for (let i = 0; i < 4; i++) {
          const usb = box(0.065, 0.035, 0.012, M.port);
          usb.position.set(-0.95 + i * 0.13, h / 2 - 0.38, -fz - 0.02);
          g.add(usb);
        }
        const inlet = box(0.2, 0.16, 0.04, M.port);
        inlet.position.set(-1.75, -h / 2 + 0.55, -fz - 0.02);
        g.add(inlet);
        const gpu = box(1.1, 0.35, 0.02, M.rail);
        gpu.position.set(0.9, h / 2 - 0.55, -fz);
        g.add(gpu);
        if (d.id === "SPC" || d.id === "GPC") {
          const output = roundedBox(d.id === "SPC" ? 0.16 : 0.18, 0.065, 0.055, M.port, 0.015);
          output.position.set(0.9, h / 2 - 0.55, -fz - 0.035);
          g.add(output);
          const usb = roundedBox(d.id === "SPC" ? 0.09 : 0.12, 0.05, 0.055, M.port, 0.018);
          usb.position.set(-0.65, h / 2 - 0.5, -fz - 0.035);
          g.add(usb);
        }
        break;
      }
      case "tpl":
      case "mdm": {
        const g = new THREE.Group();
        const h = U - 0.05;
        const cy = yOf(d.u ?? 4) + U / 2;
        const cz = FR + 0.02 - 1.0;
        g.position.set(0, cy, cz);
        root.add(g);
        const shelf = box(W19 - 0.1, 0.04, 2.6, M.rail);
        shelf.position.set(0, -h / 2, -0.3);
        g.add(shelf);
        ears(g, 0.4, M);
        const body = box(2.4, h - 0.12, 1.7, M.black);
        body.position.set(-0.9, 0, 0);
        g.add(body);
        const power = box(0.08, 0.08, 0.06, M.port);
        power.position.set(-0.1, 0, -0.85);
        g.add(power);
        const fz = 0.85;
        if (d.kind === "tpl") {
          for (let i = 0; i < 4; i++) rj45(g, -1.7 + i * 0.18, 0, -fz, M);
          rj45(g, -0.6, 0, -fz, M);
          for (const x of [-1.9, -0.4, 0.2]) {
            const a = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.7, 8), M.rail);
            a.position.set(x, h / 2 + 0.3, -0.4);
            g.add(a);
          }
          const nm = plane(0.8, 0.1, textMaterial("TP-LINK", 0.8, 0.1, "#8f98a6", null, 64));
          nm.position.set(-0.9, -h / 2 + 0.1, fz + 0.01);
          g.add(nm);
        } else {
          rj45(g, -0.3, 0, -fz, M);
          const fc = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), M.rail);
          fc.rotation.x = Math.PI / 2;
          fc.position.set(-1.6, 0, -fz);
          g.add(fc);
          const nm = plane(1.2, 0.1, textMaterial("SPECTRUM MODEM", 1.2, 0.1, "#8f98a6", null, 64));
          nm.position.set(-0.9, -h / 2 + 0.1, fz + 0.01);
          g.add(nm);
        }
        break;
      }
    }
  }

  return { overlays, pending };
}
