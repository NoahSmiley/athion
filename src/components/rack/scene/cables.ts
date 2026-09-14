import * as THREE from "three";
import { COLORS, type Cable } from "@/lib/rack/cables";
import { isRear, type Vec3 } from "@/lib/rack/geometry";
import type { AnchorMap } from "@/lib/rack/anchors";
import { resolveRef } from "@/lib/rack/anchors";
import { routeAll } from "@/lib/rack/routing";
import { speedLabel } from "@/lib/rack/cables";
import { box, textMaterial } from "./labels";

export type CableObject = THREE.Object3D & { userData: { cable: Cable; off: boolean } };

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
  const t = 0.018;
  for (const [dx, dy, w, h] of [
    [0, 0.075, 0.16, t],
    [0, -0.075, 0.16, t],
    [-0.078, 0, t, 0.13],
    [0.078, 0, t, 0.13],
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
    const path = filleted(route.points, route.fillet);
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

    // Etherlighting on the switch, link LEDs on the UDM Pro / UCI
    for (const ref of [run.from, run.to]) {
      const dev = ref[0];
      if (dev === "SW" && overlays.SW) {
        const v = resolveRef(anchors, ref);
        etherFrame(overlays.SW, v.x, v.y, v.z + 0.012, off ? 0x2a3038 : COLORS[c.speed]);
        const boot = box(0.1, 0.1, 0.14, new THREE.MeshBasicMaterial({ color: off ? 0xd8dbe0 : COLORS[c.speed], transparent: true, opacity: off ? 0.5 : 0.75 }));
        boot.position.set(v.x, v.y, v.z + 0.08);
        overlays.SW.add(boot);
      } else if ((dev === "UDM" || dev === "UCI") && overlays[dev]) {
        const v = resolveRef(anchors, ref);
        if (!isRear(v)) {
          const led = box(0.03, 0.018, 0.006, new THREE.MeshBasicMaterial({ color: COLORS[c.speed] }));
          led.position.set(v.x - 0.04, v.y + 0.075, v.z + 0.012);
          overlays[dev].add(led);
        }
      }
    }

    if (run.tagged) {
      const tag = new THREE.Sprite(
        new THREE.SpriteMaterial({
          map: textMaterial(`${c.id}  ${speedLabel(c.speed)}`, 1, 0.36, "#fff", `#${COLORS[c.speed].toString(16).padStart(6, "0")}`, 150, "700").map!,
          depthTest: true,
          transparent: true,
        }),
      ) as unknown as CableObject;
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
export function highlightCables(objects: CableObject[], id: string | null) {
  for (const o of objects) {
    const on = o.userData.cable.id === id;
    const sprite = o as unknown as THREE.Sprite;
    if (sprite.isSprite) {
      sprite.material.opacity = !id || on ? 1 : 0.2;
      continue;
    }
    const m = (o as unknown as THREE.Mesh).material as THREE.MeshStandardMaterial;
    m.emissiveIntensity = on ? (o.userData.off ? 0.35 : 0.75) : id || o.userData.off ? 0 : 0.12;
    m.transparent = true;
    m.opacity = !id || on ? 1 : 0.3;
  }
}
