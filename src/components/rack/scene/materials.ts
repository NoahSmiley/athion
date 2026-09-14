import * as THREE from "three";

/** Shared materials. Created once per scene build; all procedural geometry draws from this palette. */
export function makeMaterials() {
  return {
    steel: new THREE.MeshStandardMaterial({ color: 0x1b1e23, metalness: 0.55, roughness: 0.5 }),
    rail: new THREE.MeshStandardMaterial({ color: 0x2a2e34, metalness: 0.6, roughness: 0.45 }),
    silver: new THREE.MeshStandardMaterial({ color: 0xd9dcdf, metalness: 0.45, roughness: 0.32 }),
    silverDark: new THREE.MeshStandardMaterial({ color: 0xb9bdc2, metalness: 0.5, roughness: 0.35 }),
    black: new THREE.MeshStandardMaterial({ color: 0x17191d, metalness: 0.35, roughness: 0.6 }),
    pdu: new THREE.MeshStandardMaterial({ color: 0x111316, metalness: 0.3, roughness: 0.65 }),
    mesh: new THREE.MeshStandardMaterial({ color: 0x090b0e, roughness: 1 }),
    port: new THREE.MeshStandardMaterial({ color: 0x0b0d10, roughness: 0.9 }),
    keystone: new THREE.MeshStandardMaterial({ color: 0xf2f3f5, roughness: 0.55 }),
    screen: new THREE.MeshBasicMaterial({ color: 0x0a1f44 }),
    brush: new THREE.MeshStandardMaterial({ color: 0x08090b, roughness: 1 }),
    fan: new THREE.MeshStandardMaterial({ color: 0x14171b, roughness: 0.9, side: THREE.DoubleSide }),
    hub: new THREE.MeshStandardMaterial({ color: 0x33383f, roughness: 0.8 }),
    glass: new THREE.MeshPhysicalMaterial({ color: 0xbfd0e4, transparent: true, opacity: 0.12, roughness: 0.05, metalness: 0, side: THREE.DoubleSide, depthWrite: false }),
    side: new THREE.MeshStandardMaterial({ color: 0x1b1e23, metalness: 0.5, roughness: 0.55, side: THREE.DoubleSide }),
    floor: new THREE.MeshStandardMaterial({ color: 0x14171c, roughness: 1 }),
    ceiling: new THREE.MeshStandardMaterial({ color: 0xd7d9dc, roughness: 0.95 }),
  };
}
export type Materials = ReturnType<typeof makeMaterials>;
