import * as THREE from "three";
import { COLORS, type Cable, type Ref } from "@/lib/rack/cables";
import { isRear, type Vec3 } from "@/lib/rack/geometry";
import type { AnchorMap } from "@/lib/rack/anchors";
import { resolveRef } from "@/lib/rack/anchors";
import { routeAll } from "@/lib/rack/routing";
import { speedLabel } from "@/lib/rack/cables";
import { box, textMaterial } from "./labels";

export type CableObject = THREE.Object3D & { userData: { cable: Cable; off: boolean; overviewOnly?: boolean } };

const toV = (p: Vec3) => new THREE.Vector3(p.x, p.y, p.z);

/** Polyline -> CurvePath with quadratic fillets at each corner. */
function filleted(pts: Vec3[], r: number): THREE.CurvePath<THREE.Vector3> {
  const path = new THREE.CurvePath<THREE.Vector3>();
  const P = pts.map(toV);
  let cur = P[0];
  for (let i = 1; i < P.length; i++) {
    const nxt = P[i];
    if (i < P.length - 1) {
      const dirIn = nxt.clone().sub(cur).normalize();
      const dirOut = P[i + 1].clone().sub(nxt).normalize();
      const rr = Math.min(r, cur.distanceTo(nxt) / 2, nxt.distanceTo(P[i + 1]) / 2);
      const a = nxt.clone().sub(dirIn.clone().multiplyScalar(rr));
      const b = nxt.clone().add(dirOut.clone().multiplyScalar(rr));
      path.add(new THREE.LineCurve3(cur, a));
      path.add(new THREE.QuadraticBezierCurve3(a, nxt.clone(), b));
      cur = b;
    } else path.add(new THREE.LineCurve3(cur, nxt));
  }
  return path;
}

/** Etherlighting-style frame around a switch port. */
function etherFrame(g: THREE.Group, x: number, y: number, z: number, col: number) {
  const mat = new THREE.MeshBasicMaterial({ color: col });
  const t = 0.008;
  for (const [dx, dy, w, h] of [
    [0, 0.064, 0.134, t],
    [0, -0.064, 0.134, t],
    [-0.065, 0, t, 0.12],
    [0.065, 0, t, 0.12],
  ]) {
    const b = box(w, h, 0.006, mat);
    b.position.set(x + dx, y + dy, z);
    g.add(b);
  }
}

export function buildCables(root: THREE.Group, list: Cable[], anchors: AnchorMap, overlays: Record<string, THREE.Group>): CableObject[] {
  const objects: CableObject[] = [];
  for (const { run, route } of routeAll(list, anchors)) {
    const c = run.cable;
    const off = c.speed === "OFF";
    const path = filleted(c.via === "AP" ? route.points.slice(3) : route.points, route.fillet);
    const r = c.speed === "10G" ? 0.042 : c.speed === "COAX" ? 0.038 : c.speed === "AC" ? 0.05 : 0.028;
    const mat = new THREE.MeshStandardMaterial({
      color: COLORS[c.speed],
      roughness: 0.45,
      metalness: 0.05,
      emissive: COLORS[c.speed],
      emissiveIntensity: off || c.speed === "AC" ? 0 : 0.12,
    });
    const tube = new THREE.Mesh(new THREE.TubeGeometry(path, 200, r, 10, false), mat) as unknown as CableObject;
    tube.userData = { cable: c, off };
    root.add(tube);
    objects.push(tube);
    if (c.via === "AP") {
      const extension = new THREE.Mesh(new THREE.TubeGeometry(filleted(route.points.slice(0, 4), route.fillet), 100, r, 10, false), mat) as unknown as CableObject;
      extension.userData = { cable: c, off, overviewOnly: true };
      root.add(extension);
      objects.push(extension);
    }

    // Plugs overlap the socket mouth; the cable leaves along the socket normal before bending.
    const endpoints: Ref[] = c.via === "AP" ? [["AP", "port"], run.to] : [run.from, run.to];
    for (const ref of endpoints) {
      const [dev, kind] = ref;
      if (dev === "ENTRY" || dev.endsWith("_DESK") || kind === "inlet") continue;
      const v = resolveRef(anchors, ref);
      const direction = new THREE.Vector3(0, dev === "AP" ? 1 : 0, dev === "AP" ? 0 : isRear(v) ? -1 : 1);
      const sfp = kind === "sfp";
      const power = c.speed === "AC";
      const video = kind === "display";
      const usb = kind === "usb";
      const w = power ? 0.19 : sfp ? 0.132 : video ? 0.15 : usb ? 0.083 : 0.095;
      const h = power ? 0.14 : sfp ? 0.077 : video || usb ? 0.046 : 0.082;
      const length = power ? 0.20 : sfp ? 0.23 : 0.16;
      const plug = box(w, h, length, new THREE.MeshStandardMaterial({ color: power ? 0x28303a : sfp ? 0x737d88 : COLORS[c.speed], roughness: 0.48, metalness: sfp ? 0.65 : 0.08 })) as unknown as CableObject;
      plug.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), direction);
      plug.position.copy(toV(v)).addScaledVector(direction, length / 2 - 0.025);
      plug.userData = { cable: c, off, overviewOnly: dev === "AP" };
      root.add(plug);
      objects.push(plug);
      if (dev === "SW" && kind === "p" && overlays.SW) etherFrame(overlays.SW, v.x, v.y, v.z + 0.001, off ? 0x2a3038 : COLORS[c.speed]);
    }

    if (run.tagged) {
      const tag = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: textMaterial(`${c.id}  ${speedLabel(c.speed)}`, 1, 0.36, "#fff", `#${COLORS[c.speed].toString(16).padStart(6, "0")}`, 150, "700").map!,
          depthTest: true,
          transparent: true,
        }),
      ) as unknown as CableObject;
      tag.visible = false;
      tag.scale.set(c.multi ? 0.62 : 0.78, c.multi ? 0.22 : 0.28, 1);
      tag.position.copy(toV(route.mid));
      if (c.multi) tag.position.y += 0.12;
      tag.userData = { cable: c, off };
      root.add(tag);
      objects.push(tag);
    }
  }
  return objects;
}

/** Dim everything except the cable with `id` (null = show all). */
export function highlightCables(objects: CableObject[], id: string | string[] | null, labels = false) {
  for (const o of objects) {
    const on = Array.isArray(id) ? id.includes(o.userData.cable.id) : o.userData.cable.id === id;
    const sprite = o as unknown as THREE.Sprite;
    if (sprite.isSprite) {
      sprite.visible = labels || on;
      sprite.material.opacity = !id || on ? 1 : 0.2;
      continue;
    }
    const m = (o as unknown as THREE.Mesh).material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = on ? (o.userData.off ? 0.35 : 0.75) : id || o.userData.off ? 0 : 0.12;
    m.transparent = !!id && !on;
    m.depthWrite = !m.transparent;
    m.opacity = !id || on ? 1 : 0.18;
  }
}
