"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { computeAnchors } from "@/lib/rack/anchors";
import { SCHEDULE, type Cable } from "@/lib/rack/cables";
import { devicesFor } from "@/lib/rack/devices";
import { yOf, type Mode } from "@/lib/rack/geometry";
import { buildCabinet, buildCeiling } from "./cabinet";
import { buildCables, highlightCables, type CableObject } from "./cables";
import { buildDevices } from "./devices";
import { makeMaterials } from "./materials";

export type ViewPreset = "front" | "rear";

interface Props {
  mode: Mode;
  selectedId: string | null;
  hoveredId: string | null;
  sidePanels: boolean;
  /** Incrementing token + preset; bump to re-aim the camera. */
  view: { preset: ViewPreset; n: number };
  onHover: (cable: Cable | null, x: number, y: number) => void;
  onSelect: (cable: Cable | null) => void;
  onLoadState: (state: "loading" | "loaded" | "fallback") => void;
}

/**
 * Imperative three.js scene behind a React surface. Rebuilds the whole scene when `mode` changes;
 * hover/select/side-panel/view changes only touch materials and the camera.
 */
export function RackScene({ mode, selectedId, hoveredId, sidePanels, view, onHover, onSelect, onLoadState }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef<{
    renderer: THREE.WebGLRenderer;
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    controls: OrbitControls;
    root: THREE.Group;
    cables: CableObject[];
    sides: THREE.Mesh[];
    raf: number;
  } | null>(null);
  const cb = useRef({ onHover, onSelect, onLoadState });
  cb.current = { onHover, onSelect, onLoadState };

  const centerY = yOf(9) + 0.2;

  // renderer, camera, lights, controls: once
  useEffect(() => {
    const host = hostRef.current!;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(new THREE.Color(0x0b0e12));
    host.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 400);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x3a4250, 0.85));
    const key = new THREE.DirectionalLight(0xffffff, 0.9);
    key.position.set(6, 26, 22);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xcfe0ff, 0.35);
    fill.position.set(-14, 8, -14);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0xffffff, 0.25);
    rim.position.set(0, 10, -30);
    scene.add(rim);
    // Metals need an environment to reflect or they render black.
    const pm = new THREE.PMREMGenerator(renderer);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5;
    controls.maxDistance = 60;
    controls.maxPolarAngle = Math.PI * 0.62;
    const root = new THREE.Group();
    scene.add(root);

    const st = { renderer, scene, camera, controls, root, cables: [] as CableObject[], sides: [] as THREE.Mesh[], raf: 0 };
    stateRef.current = st;

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const ray = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let downAt: [number, number] | null = null;
    const pick = (e: PointerEvent): Cable | null => {
      const r = host.getBoundingClientRect();
      mouse.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(mouse, camera);
      const hit = ray.intersectObjects(st.cables)[0];
      return hit ? (hit.object as CableObject).userData.cable : null;
    };
    const onMove = (e: PointerEvent) => {
      if (e.buttons) return;
      const c = pick(e);
      const r = host.getBoundingClientRect();
      host.style.cursor = c ? "pointer" : "grab";
      cb.current.onHover(c, e.clientX - r.left, e.clientY - r.top);
    };
    const onDown = (e: PointerEvent) => (downAt = [e.clientX, e.clientY]);
    const onUp = (e: PointerEvent) => {
      if (downAt && Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) < 4) cb.current.onSelect(pick(e));
      downAt = null;
    };
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointerup", onUp);

    const loop = () => {
      controls.update();
      renderer.render(scene, camera);
      st.raf = requestAnimationFrame(loop);
    };
    loop();

    return () => {
      cancelAnimationFrame(st.raf);
      ro.disconnect();
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointerup", onUp);
      controls.dispose();
      renderer.dispose();
      renderer.domElement.remove();
      stateRef.current = null;
    };
  }, []);

  // scene contents: per mode
  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    while (st.root.children.length) st.root.remove(st.root.children[0]);
    const M = makeMaterials();
    const devices = devicesFor(mode);
    const anchors = computeAnchors(devices);
    const { sidePanels: sides } = buildCabinet(st.root, M);
    buildCeiling(st.root, M);
    const { overlays, pending } = buildDevices(st.root, devices, anchors, M);
    st.cables = buildCables(st.root, SCHEDULE[mode], anchors, overlays);
    st.sides = sides;
    sides.forEach((p) => (p.visible = sidePanels));
    cb.current.onLoadState("loading");
    let live = true;
    Promise.allSettled(pending).then((rs) => {
      if (live) cb.current.onLoadState(rs.every((r) => r.status === "fulfilled") ? "loaded" : "fallback");
    });
    return () => {
      live = false;
    };
    // sidePanels handled separately; intentionally not a dependency here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  useEffect(() => {
    stateRef.current?.sides.forEach((p) => (p.visible = sidePanels));
  }, [sidePanels]);

  useEffect(() => {
    const st = stateRef.current;
    if (st) highlightCables(st.cables, hoveredId ?? selectedId);
  }, [hoveredId, selectedId, mode]);

  useEffect(() => {
    const st = stateRef.current;
    if (!st) return;
    const th = view.preset === "front" ? 0.42 : Math.PI - 0.42;
    const d = 19;
    st.camera.position.set(d * Math.sin(th), centerY + 3, d * Math.cos(th));
    st.controls.target.set(0, centerY, 0);
    st.controls.update();
  }, [view, centerY]);

  return <div ref={hostRef} className="rack-view" />;
}
