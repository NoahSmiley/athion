import * as THREE from "three";
import { FACE } from "@/lib/rack/devices";
import { FR, U, yOf } from "@/lib/rack/geometry";
import { box, plane, roundedBox, textMaterial } from "./labels";
import type { Materials } from "./materials";

/** PDUMH20: plain front with two-digit green meter, twelve rear 5-15/20R receptacles. */
export function buildPdu(root: THREE.Group, unit: number, M: Materials) {
  const width = 4.445;
  const height = 0.437;
  const depth = FACE.depth.pdu;
  const g = new THREE.Group();
  g.position.set(0, yOf(unit) + U / 2, FR + 0.02 - depth / 2);
  root.add(g);
  const body = roundedBox(width, height, depth, M.pdu, 0.014);
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  const front = depth / 2;
  for (const side of [-1, 1]) {
    const ear = box(0.18, height, 0.035, M.pdu);
    ear.position.set(side * (width / 2 + 0.09), 0, front - 0.018);
    g.add(ear);
    for (const y of [-0.15, 0, 0.15]) {
      const hole = roundedBox(0.085, 0.065, 0.006, M.port, 0.027);
      hole.position.set(ear.position.x, y, front + 0.003);
      g.add(hole);
    }
  }
  const logo = plane(0.48, 0.13, textMaterial("TRIPP LITE", 0.48, 0.13, "#eceff2", null, 180, "700"));
  logo.position.set(-1.83, 0.035, front + 0.006);
  g.add(logo);
  const subline = plane(0.48, 0.045, textMaterial("POWER PROTECTION", 0.48, 0.045, "#adb3ba", null, 90));
  subline.position.set(-1.83, -0.07, front + 0.006);
  g.add(subline);
  const bezel = roundedBox(0.31, 0.32, 0.022, M.black, 0.014);
  bezel.position.set(-1.25, 0, front + 0.01);
  g.add(bezel);
  // Segments are illustrative, not a live current reading. Unpowered "88" outlines sit behind "00".
  const lit = new THREE.MeshBasicMaterial({ color: 0xa3d62a, toneMapped: false });
  const dim = new THREE.MeshBasicMaterial({ color: 0x263219 });
  for (const x of [-1.318, -1.202]) {
    for (const [dx, dy, w, h, active] of [
      [0, 0.105, 0.068, 0.015, 1], [0, 0.017, 0.068, 0.015, 0], [0, -0.071, 0.068, 0.015, 1],
      [-0.04, 0.061, 0.014, 0.062, 1], [0.04, 0.061, 0.014, 0.062, 1],
      [-0.04, -0.027, 0.014, 0.062, 1], [0.04, -0.027, 0.014, 0.062, 1],
    ]) {
      const segment = box(w, h, 0.004, active ? lit : dim);
      segment.position.set(x + dx, dy, front + 0.025);
      g.add(segment);
    }
  }
  const amps = plane(0.24, 0.05, textMaterial("AMPS", 0.24, 0.05, "#cbd1c0", null, 170));
  amps.position.set(-1.25, -0.124, front + 0.026);
  g.add(amps);

  const outletMat = new THREE.MeshStandardMaterial({ color: 0x353735, roughness: 0.7 });
  for (let i = 0; i < FACE.pdu.outletCount; i++) {
    const x = FACE.pdu.outletX(i);
    const socket = roundedBox(0.258, 0.285, 0.025, outletMat, 0.048);
    socket.position.set(x, 0, -front - 0.008);
    g.add(socket);
    // NEMA 5-15/20R T-slot, straight blade slot, and rounded grounding opening.
    for (const [dx, dy, w, h] of [[-0.058, 0.04, 0.02, 0.077], [-0.058, 0.04, 0.078, 0.02], [0.058, 0.04, 0.02, 0.077]]) {
      const slot = box(w, h, 0.006, M.port);
      slot.position.set(x + dx, dy, -front - 0.024);
      g.add(slot);
    }
    const ground = roundedBox(0.052, 0.056, 0.006, M.port, 0.022);
    ground.position.set(x, -0.072, -front - 0.024);
    g.add(ground);
  }
  const entry = new THREE.Mesh(new THREE.CylinderGeometry(0.073, 0.06, 0.09, 16), M.black);
  entry.rotation.x = Math.PI / 2;
  entry.position.set(FACE.pdu.inletX, 0, -front - 0.045);
  g.add(entry);
  const breaker = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.018, 16), M.black);
  breaker.rotation.x = Math.PI / 2;
  breaker.position.set(1.99, 0.075, -front - 0.015);
  g.add(breaker);
  const lug = new THREE.Mesh(new THREE.CylinderGeometry(0.033, 0.033, 0.025, 12), M.silverDark);
  lug.rotation.x = Math.PI / 2;
  lug.position.set(1.99, -0.09, -front - 0.025);
  g.add(lug);
}
