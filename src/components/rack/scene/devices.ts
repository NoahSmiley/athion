import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { AP_POS, FR, U, W19, yOf } from "@/lib/rack/geometry";
import { FACE, type Device } from "@/lib/rack/devices";
import type { AnchorMap } from "@/lib/rack/anchors";
import { box, plane, textMaterial } from "./labels";
import type { Materials } from "./materials";

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
    const n = obj.getObjectByName(hint);
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
    g.rotateY(Math.PI);
    g.updateMatrixWorld(true);
  }
  return g;
}

/** Scale a 1U model to 43.7 mm tall and mount it on the front rail of its rack unit. */
function placeRackModel(g: THREE.Group, d: Device) {
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
function placeAP(g: THREE.Group) {
  g.updateMatrixWorld(true);
  const b = new THREE.Box3().setFromObject(g);
  const sz = b.getSize(new THREE.Vector3());
  g.scale.setScalar(2.06 / Math.max(sz.x, sz.z));
  g.updateMatrixWorld(true);
  const fc = g.getObjectByName("Front_Case.001") || g.getObjectByName("Front_Case");
  const b2 = new THREE.Box3().setFromObject(g);
  const mid = (b2.min.y + b2.max.y) / 2;
  if (fc) {
    const c = new THREE.Box3().setFromObject(fc).getCenter(new THREE.Vector3());
    if (c.y > mid) {
      g.rotateX(Math.PI);
      g.updateMatrixWorld(true);
    }
  }
  const b3 = new THREE.Box3().setFromObject(g);
  const c3 = b3.getCenter(new THREE.Vector3());
  g.position.add(new THREE.Vector3(AP_POS.x - c3.x, AP_POS.y - b3.max.y, AP_POS.z - c3.z));
  g.updateMatrixWorld(true);
}

function tuneMaterials(scene: THREE.Object3D, intensity: number) {
  scene.traverse((o) => {
    const mesh = o as THREE.Mesh;
    if (!mesh.isMesh || !mesh.material) return;
    const m = mesh.material as THREE.MeshStandardMaterial;
    m.envMapIntensity = intensity;
    if (m.metalness === undefined || m.metalness > 0.75) m.metalness = 0.7;
    if (m.roughness !== undefined && m.roughness < 0.3 && !m.roughnessMap) m.roughness = 0.3;
    m.needsUpdate = true;
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
    for (let i = 0; i < 24; i++) rj45(g, x(FACE.sw.ports(i)[0]), 0, fz, M);
    for (const [fx] of FACE.sw.sfp) {
      const m = box(0.16, 0.13, 0.05, M.port);
      m.position.set(x(fx), 0, fz);
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
    rj45(g, x(FACE.uci.port[0]), 0, fz, M);
    const fc = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 16), M.rail);
    fc.rotation.x = Math.PI / 2;
    fc.position.set(0, 0, -fz);
    g.add(fc);
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
              holder.add(g);
            })
            .catch((err) => {
              console.warn("rack: model failed, drawing stand-in", d.glb, String(err));
              drawStandIn(d, holder, depth, M);
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
              const g = orientModel(gltf.scene, "density");
              placeAP(g);
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
          const coupler = i < 3;
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
        // Tripp Lite PDUMH20: 1U black steel, logo + green amp meter, 2 front outlets, 10 rear outlets, L5-20P cord.
        const g = new THREE.Group();
        const h = U - 0.05;
        const dep = FACE.depth.pdu;
        const cy = yOf(d.u ?? 1) + U / 2;
        const cz = FR + 0.02 - dep / 2;
        const fz = dep / 2;
        g.position.set(0, cy, cz);
        root.add(g);
        g.add(box(W19 - 0.2, h, dep, M.pdu));
        for (const sd of [-1, 1]) {
          const e = box(0.2, h, 0.05, M.pdu);
          e.position.set(sd * (W19 / 2 - 0.1), 0, fz);
          g.add(e);
        }
        const logo = plane(0.7, 0.12, textMaterial("TRIPP·LITE", 0.7, 0.12, "#e8ecf1", null, 70, "700"));
        logo.position.set(-W19 / 2 + 0.55, 0, fz + 0.003);
        g.add(logo);
        const meter = box(0.5, 0.22, 0.01, new THREE.MeshBasicMaterial({ color: 0x0a0c0a }));
        meter.position.set(-W19 / 2 + 1.15, 0, fz + 0.004);
        g.add(meter);
        const digits = plane(0.42, 0.16, textMaterial("20 AMPS", 0.42, 0.16, "#7CFC5A", null, 90, "700"));
        digits.position.set(-W19 / 2 + 1.15, 0, fz + 0.011);
        g.add(digits);
        const outletMat = new THREE.MeshStandardMaterial({ color: 0x1d2024, roughness: 0.8 });
        const slotMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const outlet = (x: number, z: number, rear: boolean) => {
          const o = box(0.19, 0.19, 0.02, outletMat);
          o.position.set(x, 0, z);
          g.add(o);
          [
            [0, 0.05],
            [-0.035, -0.03],
            [0.035, -0.03],
          ].forEach(([dx, dy], i) => {
            const sl = box(i ? 0.02 : 0.045, i ? 0.05 : 0.03, 0.005, slotMat);
            sl.position.set(x + dx, dy, z + (rear ? -0.013 : 0.013));
            g.add(sl);
          });
        };
        outlet(W19 / 2 - 0.75, fz + 0.003, false);
        outlet(W19 / 2 - 0.45, fz + 0.003, false);
        for (let i = 0; i < 10; i++) outlet(-W19 / 2 + 0.45 + i * 0.32, -fz - 0.003, true);
        const cordEntry = box(0.14, 0.14, 0.08, M.pdu);
        cordEntry.position.set(W19 / 2 - 0.5, 0, -fz - 0.04);
        g.add(cordEntry);
        const nm = plane(1.3, 0.09, textMaterial("PDUMH20  ·  20 A METERED PDU", 1.3, 0.09, "#6d7684", null, 56));
        nm.position.set(0.4, -h / 2 + 0.035, fz + 0.003);
        g.add(nm);
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
        // SilverStone RM44/RM51: full-width filtered mesh, three 120 mm intake fans, power LED, rack ears; rear I/O + PSU.
        const g = new THREE.Group();
        const w = W19 - 0.1;
        const h = (d.h ?? 4) * U - 0.06;
        const dep = d.d ?? 4.7;
        const cy = yOf((d.u ?? 6) + (d.h ?? 4) - 1) + h / 2 + 0.03;
        const cz = FR + 0.02 - dep / 2;
        const fz = dep / 2;
        g.position.set(0, cy, cz);
        root.add(g);
        g.add(box(w, h, dep, M.black));
        const mesh = plane(w - 0.8, h - 0.28, M.mesh);
        mesh.position.set(0.05, 0, fz + 0.001);
        g.add(mesh);
        const fr = Math.min(0.6, (h - 0.5) / 2);
        for (let i = 0; i < 3; i++) {
          const x = -1.3 + i * 1.3;
          const frame = new THREE.Mesh(new THREE.RingGeometry(fr * 0.92, fr, 40), M.hub);
          frame.position.set(x, 0, fz + 0.006);
          g.add(frame);
          const hub = new THREE.Mesh(new THREE.CircleGeometry(fr * 0.3, 24), M.hub);
          hub.position.set(x, 0, fz + 0.007);
          g.add(hub);
          for (let b = 0; b < 7; b++) {
            const bl = box(fr * 0.62, 0.12, 0.004, M.hub);
            bl.rotation.z = (b * Math.PI) / 3.5;
            bl.position.set(x, 0, fz + 0.0065);
            g.add(bl);
          }
        }
        for (const sd of [-1, 1]) {
          const ear = box(0.34, h, 0.05, M.black);
          ear.position.set(sd * (w / 2 - 0.17), 0, fz);
          g.add(ear);
        }
        const led = box(0.05, 0.05, 0.01, new THREE.MeshBasicMaterial({ color: 0x2f8cff }));
        led.position.set(-w / 2 + 0.5, h / 2 - 0.16, fz + 0.01);
        g.add(led);
        const ss = plane(1.0, 0.1, textMaterial("SILVERSTONE", 1.0, 0.1, "#aab2bd", null, 60, "700"));
        ss.position.set(w / 2 - 0.95, h / 2 - 0.16, fz + 0.02);
        g.add(ss);
        const nm = plane(1.9, 0.2, textMaterial(d.label ?? d.id, 1.9, 0.2, "#8f98a6", null, 40));
        nm.position.set(0, -h / 2 + 0.14, fz + 0.02);
        g.add(nm);
        const io = box(1.6, 0.45, 0.02, M.rail);
        io.position.set(-0.9, h / 2 - 0.5, -fz);
        g.add(io);
        const nic = box(0.14, 0.13, 0.06, M.port);
        nic.position.set(-1.2, h / 2 - 0.45, -fz - 0.02);
        g.add(nic);
        const psu = box(1.5, 0.86, 0.02, M.rail);
        psu.position.set(-1.2, -h / 2 + 0.55, -fz);
        g.add(psu);
        const inlet = box(0.2, 0.16, 0.04, M.port);
        inlet.position.set(-1.75, -h / 2 + 0.55, -fz - 0.02);
        g.add(inlet);
        const gpu = box(1.1, 0.35, 0.02, M.rail);
        gpu.position.set(0.9, h / 2 - 0.55, -fz);
        g.add(gpu);
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
  void anchors;
  return { overlays, pending };
}
