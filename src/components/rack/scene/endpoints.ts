import * as THREE from "three";
import { DESK_ENDPOINTS } from "@/lib/rack/geometry";
import { COLORS } from "@/lib/rack/cables";
import { textMaterial } from "./labels";

/** Billboarding termination markers, deliberately not replicas of unknown desks or monitors. */
export function buildDeskEndpoints(root: THREE.Group) {
  for (const [index, desk] of DESK_ENDPOINTS.entries()) {
    const material = textMaterial(`${desk.label} · OFF RACK`, 2.5, 0.3, "#bbcce2", "#162232", 72);
    const caption = new THREE.Sprite(new THREE.SpriteMaterial({ map: material.map!, depthTest: true }));
    material.dispose();
    caption.scale.set(2.5, 0.3, 1);
    caption.position.set(desk.position.x - 0.9, desk.position.y + 0.4, desk.position.z);
    root.add(caption);
    for (const [y, color] of [[0, index === 0 ? COLORS.HDMI : COLORS.DP], [-0.45, COLORS.USB]]) {
      const marker = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 8), new THREE.MeshBasicMaterial({ color }));
      marker.position.set(desk.position.x, desk.position.y + y, desk.position.z);
      root.add(marker);
    }
  }
}
