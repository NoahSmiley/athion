import * as THREE from "three";
import { box, plane, roundedBox, textMaterial } from "./labels";
import type { Materials } from "./materials";

function polygon(points: number[][]) {
  const shape = new THREE.Shape();
  points.forEach(([x, y], i) => i ? shape.lineTo(x, y) : shape.moveTo(x, y));
  shape.closePath();
  return shape;
}

/** SilverStone's triangular/star-cross perforations, with a solid trapezoid around the latch. */
function perforatedDoor(width: number, height: number) {
  const shape = polygon([[-width / 2, -height / 2], [width / 2, -height / 2], [width / 2, height / 2], [-width / 2, height / 2]]);
  const pitch = 0.105;
  const rowHeight = pitch * Math.sqrt(3) / 2;
  for (let row = 0; row < Math.floor((height - 0.07) / rowHeight); row++) {
    const bottom = -height / 2 + 0.04 + row * rowHeight;
    for (let col = 0; col < Math.floor((width - 0.08) / pitch); col++) {
      const left = -width / 2 + 0.04 + col * pitch;
      const candidates = [
        [[left + 0.013, bottom + 0.008], [left + pitch - 0.013, bottom + 0.008], [left + pitch / 2, bottom + rowHeight - 0.014]],
        [[left + pitch / 2 + 0.013, bottom + rowHeight - 0.006], [left + pitch * 1.5 - 0.013, bottom + rowHeight - 0.006], [left + pitch, bottom + 0.014]],
      ];
      for (const points of candidates) {
        // Solid tapered badge at the top, plus a slim unperforated border.
        const insideLatch = points.some(([x, y]) => {
          const down = height / 2 - y;
          return down < 0.53 && Math.abs(x) < 0.7 - down * 0.57;
        });
        if (insideLatch || points.some(([x]) => x > width / 2 - 0.035)) continue;
        const hole = new THREE.Path();
        points.reverse().forEach(([x, y], i) => i ? hole.lineTo(x, y) : hole.moveTo(x, y));
        hole.closePath();
        shape.holes.push(hole);
      }
    }
  }
  return new THREE.ExtrudeGeometry(shape, { depth: 0.018, bevelEnabled: false, curveSegments: 1 });
}

function cylinder(radius: number, depth: number, mat: THREE.Material) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, depth, 24), mat);
  mesh.rotation.x = Math.PI / 2;
  return mesh;
}

function intakeFan(group: THREE.Group, x: number, y: number, z: number, radius: number, M: Materials) {
  const fan = new THREE.Group();
  fan.position.set(x, y, z);
  group.add(fan);
  const frame = roundedBox(radius * 2 + 0.05, radius * 2 + 0.05, 0.05, M.black);
  frame.position.z = -0.015;
  fan.add(frame);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(radius * 0.96, 0.024, 8, 48), M.hub);
  fan.add(ring);
  const blade = new THREE.Shape();
  blade.moveTo(radius * 0.13, -radius * 0.12);
  blade.bezierCurveTo(radius * 0.5, -radius * 0.44, radius * 0.96, -radius * 0.34, radius * 0.94, radius * 0.08);
  blade.quadraticCurveTo(radius * 0.64, radius * 0.04, radius * 0.24, radius * 0.24);
  blade.closePath();
  const geometry = new THREE.ShapeGeometry(blade, 8);
  for (let j = 0; j < 9; j++) {
    const mesh = new THREE.Mesh(geometry, M.hub);
    mesh.rotation.z = (j * Math.PI * 2) / 9;
    fan.add(mesh);
  }
  const hub = cylinder(radius * 0.24, 0.035, M.black);
  hub.position.z = 0.035;
  fan.add(hub);
}

/** Distinct closed RM44/RM51 fascias, reconstructed from SilverStone's product-sheet photographs. */
export function addChassisFront(group: THREE.Group, width: number, height: number, z: number, isRM51: boolean, M: Materials) {
  const face = new THREE.MeshStandardMaterial({ color: 0x343638, metalness: 0.5, roughness: 0.48 });
  const doorWidth = width - 0.09;
  const controlHeight = isRM51 ? 0.26 : 0;
  const doorHeight = height - controlHeight - 0.1;
  const centerY = controlHeight / 2;
  const surround = roundedBox(width, height, 0.05, M.black, 0.018);
  surround.position.set(0, 0, z + 0.025);
  group.add(surround);
  const backing = box(doorWidth - 0.04, doorHeight - 0.04, 0.015, M.mesh);
  backing.position.set(0, centerY, z + 0.055);
  group.add(backing);
  if (isRM51) {
    for (const x of [-0.98, 0.98]) intakeFan(group, x, centerY - 0.04, z + 0.075, 0.86, M);
  }
  // The RM44 sheet lists support for 3 x 120 mm front fans, not stock front fans.
  // The closed door therefore has a dark interior, without inventing the user's cooling configuration.
  const door = new THREE.Mesh(perforatedDoor(doorWidth, doorHeight), face);
  door.position.set(0, centerY, z + 0.15);
  door.castShadow = true;
  door.receiveShadow = true;
  group.add(door);
  const top = centerY + doorHeight / 2;
  if (isRM51) {
    const recess = new THREE.Mesh(new THREE.ShapeGeometry(polygon([[-0.46, top - 0.09], [0.46, top - 0.09], [0.34, top - 0.34], [-0.34, top - 0.34]])), M.port);
    recess.position.z = z + 0.17;
    group.add(recess);
    const pull = new THREE.Mesh(new THREE.ShapeGeometry(polygon([[-0.39, top - 0.105], [0.39, top - 0.105], [0.29, top - 0.265], [-0.29, top - 0.265]])), M.rail);
    pull.position.z = z + 0.178;
    group.add(pull);
    const lip = box(0.58, 0.045, 0.035, face);
    lip.position.set(0, top - 0.275, z + 0.18);
    group.add(lip);
    const strip = roundedBox(width - 0.05, controlHeight - 0.025, 0.045, face, 0.01);
    strip.position.set(0, -height / 2 + controlHeight / 2, z + 0.09);
    group.add(strip);
    const y = strip.position.y;
    const power = roundedBox(0.16, 0.16, 0.018, M.port, 0.022);
    power.position.set(-width / 2 + 0.22, y, z + 0.123);
    group.add(power);
    const powerMark = plane(0.1, 0.1, textMaterial("⏻", 0.1, 0.1, "#91a2b4", null, 550));
    powerMark.position.set(power.position.x, y, z + 0.136);
    group.add(powerMark);
    const reset = roundedBox(0.085, 0.09, 0.018, M.port, 0.018);
    reset.position.set(-width / 2 + 0.45, y, z + 0.123);
    group.add(reset);
    for (let i = 0; i < 4; i++) {
      const led = cylinder(0.014, 0.008, i === 0 ? new THREE.MeshBasicMaterial({ color: 0x87c9e7 }) : M.silverDark);
      led.position.set(-width / 2 + 0.6 + i * 0.09, y, z + 0.126);
      group.add(led);
    }
    for (const x of [-width / 2 + 1.06, -width / 2 + 1.27, -width / 2 + 1.48]) {
      const usb = roundedBox(x > -width / 2 + 1.4 ? 0.09 : 0.15, 0.052, 0.018, M.port, 0.013);
      usb.position.set(x, y, z + 0.125);
      group.add(usb);
    }
  } else {
    const lock = cylinder(0.105, 0.05, M.black);
    lock.position.set(0, top - 0.25, z + 0.197);
    group.add(lock);
    const keyBarrel = cylinder(0.058, 0.01, M.silverDark);
    keyBarrel.position.set(0, lock.position.y, z + 0.229);
    group.add(keyBarrel);
    const keyhole = box(0.013, 0.054, 0.008, M.port);
    keyhole.position.set(0, lock.position.y, z + 0.239);
    group.add(keyhole);
    const latch = roundedBox(0.055, 0.18, 0.04, M.black, 0.015);
    latch.position.set(0, top - 0.13, z + 0.192);
    group.add(latch);
  }
  const brand = plane(0.67, 0.065, textMaterial("SilverStone", 0.67, 0.065, "#8e9297", null, 85));
  brand.position.set(0, top - 0.435, z + 0.173);
  group.add(brand);
  for (const side of [-1, 1]) {
    // Rack ears sit outside the 440 mm chassis; handles project in front of them.
    const ear = roundedBox(0.18, height - 0.05, 0.055, M.black, 0.014);
    ear.position.set(side * (width / 2 + 0.08), 0, z + 0.035);
    group.add(ear);
    const handle = roundedBox(0.105, height * 0.76, 0.1, M.black, 0.045);
    handle.position.set(side * (width / 2 + 0.08), 0, z + 0.32);
    group.add(handle);
    for (const y of [-height * 0.34, height * 0.34]) {
      const mount = roundedBox(0.1, 0.11, 0.28, M.black, 0.035);
      mount.position.set(handle.position.x, y, z + 0.18);
      group.add(mount);
    }
    for (const y of [-height / 2 + 0.075, height / 2 - 0.075]) {
      const screw = cylinder(0.041, 0.016, M.silverDark);
      screw.position.set(ear.position.x, y, z + 0.075);
      group.add(screw);
    }
  }
}
