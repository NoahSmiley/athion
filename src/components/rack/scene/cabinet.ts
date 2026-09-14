import * as THREE from "three";
import { AP_POS, CD, CH, CW, FR, RR, TOP, U, W19 } from "@/lib/rack/geometry";
import { box, plane, textMaterial } from "./labels";
import type { Materials } from "./materials";

/** Kendall Howard LINIER 42U: base, top with cable access, solid side panels, four rails, glass doors swung open. */
export function buildCabinet(root: THREE.Group, M: Materials): { sidePanels: THREE.Mesh[] } {
  const base = box(CW, 0.25, CD, M.steel);
  base.position.set(0, 0.125, 0);
  root.add(base);
  const top = box(CW, 0.15, CD, M.steel);
  top.position.set(0, CH - 0.075, 0);
  root.add(top);
  for (const [sx, sz] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ]) {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.16, 20), M.black);
    c.rotation.z = Math.PI / 2;
    c.position.set(sx * (CW / 2 - 0.5), -0.12, sz * (CD / 2 - 0.5));
    root.add(c);
  }
  const entry = box(2.6, 0.06, 0.55, M.brush);
  entry.position.set(0, CH + 0.01, -CD / 2 + 0.75);
  root.add(entry);
  const el = plane(1.6, 0.12, textMaterial("TOP CABLE ACCESS", 1.6, 0.12, "#7d8694", null, 70));
  el.rotation.x = -Math.PI / 2;
  el.position.set(0, CH + 0.03, -CD / 2 + 1.25);
  root.add(el);

  const sidePanels: THREE.Mesh[] = [];
  for (const sd of [-1, 1]) {
    const sp = plane(CD - 0.2, CH - 0.4, M.side);
    sp.rotation.y = Math.PI / 2;
    sp.position.set((sd * CW) / 2, CH / 2, 0);
    root.add(sp);
    sidePanels.push(sp);
    for (const z of [CD / 2 - 0.06, -CD / 2 + 0.06]) {
      const b = box(0.12, CH, 0.12, M.steel);
      b.position.set(sd * (CW / 2 - 0.06), CH / 2, z);
      root.add(b);
    }
  }

  const door = (hingeX: number, hingeZ: number, dir: number) => {
    const g = new THREE.Group();
    const dw = CW - 0.24;
    const frame = new THREE.Group();
    for (const [y, h] of [
      [0.25, 0.5],
      [CH - 0.65, 0.5],
    ]) {
      const b = box(dw, h, 0.08, M.steel);
      b.position.set((dir * dw) / 2, y + h / 2, 0);
      frame.add(b);
    }
    for (const x of [0, dw]) {
      const b = box(0.35, CH - 0.4, 0.08, M.steel);
      b.position.set(dir * x + (x ? -dir * 0.175 : dir * 0.175), CH / 2, 0);
      frame.add(b);
    }
    const gl = plane(dw - 0.7, CH - 1.55, M.glass);
    gl.position.set((dir * dw) / 2, CH / 2, 0);
    frame.add(gl);
    const handle = box(0.06, 0.9, 0.05, M.silverDark);
    handle.position.set(dir * (dw - 0.55), CH / 2, 0.08);
    frame.add(handle);
    g.add(frame);
    g.position.set(hingeX, 0, hingeZ);
    g.rotation.y = dir * -1 * Math.PI * 0.86 * (hingeZ > 0 ? 1 : -1);
    root.add(g);
  };
  door(-CW / 2 + 0.12, CD / 2 + 0.05, 1);
  door(CW / 2 - 0.12, -CD / 2 - 0.05, -1);

  const railG = new THREE.BoxGeometry(0.18, TOP * U, 0.18);
  for (const [x, z] of [
    [-W19 / 2 - 0.09, FR],
    [W19 / 2 + 0.09, FR],
    [-W19 / 2 - 0.09, RR],
    [W19 / 2 + 0.09, RR],
  ]) {
    const m = new THREE.Mesh(railG, M.rail);
    m.position.set(x, (TOP * U) / 2 + 0.25, z);
    root.add(m);
  }
  const holeG = new THREE.BoxGeometry(0.075, 0.075, 0.01);
  const holeM = new THREE.MeshBasicMaterial({ color: 0x07080a });
  for (let u = 0; u < TOP; u++)
    for (const sd of [-1, 1])
      for (let k = 0; k < 3; k++) {
        const h = new THREE.Mesh(holeG, holeM);
        h.position.set(sd * (W19 / 2 + 0.09), 0.25 + u * U + 0.075 + k * 0.148, FR + 0.091);
        root.add(h);
      }
  for (const sd of [-1, 1])
    for (const y of [0.4, CH - 0.5]) {
      const b = box(0.1, 0.1, FR - RR, M.rail);
      b.position.set(sd * (W19 / 2 + 0.09), y, (FR + RR) / 2);
      root.add(b);
    }
  const badge = plane(2.6, 0.24, textMaterial("KENDALL HOWARD  ·  LINIER 42U", 2.6, 0.24, "#7d8694", null, 90));
  badge.position.set(0, CH + 0.35, CD / 2);
  root.add(badge);
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), M.floor);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.2;
  root.add(floor);
  return { sidePanels };
}

/** Ceiling slab outside the cabinet where the U7 Pro hangs. */
export function buildCeiling(root: THREE.Group, M: Materials) {
  const slab = box(7.5, 0.12, 7, M.ceiling);
  slab.position.set(AP_POS.x, CH + 2.46, AP_POS.z);
  root.add(slab);
  const lb = plane(2.2, 0.2, textMaterial("CEILING  ·  U7 PRO", 2.2, 0.2, "#7d8694", null, 80));
  lb.rotation.x = Math.PI / 2;
  lb.rotation.z = Math.PI;
  lb.position.set(AP_POS.x, CH + 2.39, 2.2);
  root.add(lb);
}
